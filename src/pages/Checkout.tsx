import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  FileText, 
  Lock, 
  Loader2, 
  ChevronRight,
  Shield,
  BadgeCheck,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Checkout: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cardNumber: "",
    cardHolder: "",
    cardExpiry: "",
    cardCvv: ""
  });

  const referralCode = searchParams.get("ref") || localStorage.getItem("allvita_partner_ref");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();
          
        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Produto não encontrado");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setIsProcessing(true);
    const loadingToast = toast.loading("Processando seu pedido...");
    
    try {
      // 1. Get Partner ID if referral exists
      let partnerId = null;
      if (referralCode) {
        const { data: partnerData } = await supabase
          .from("partners")
          .select("id")
          .eq("referral_code", referralCode)
          .single();
        if (partnerData) partnerId = partnerData.id;
      }

      // 2. Upsert Client
      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .upsert({
          tenant_id: currentTenant?.id as string,
          full_name: formData.name,
          email: formData.email,
          document: formData.cpf.replace(/\D/g, ""),
          phone: formData.phone.replace(/\D/g, ""),
          metadata: {
            address: {
              zip_code: formData.zipCode,
              street: formData.street,
              number: formData.number,
              complement: formData.complement,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state
            }
          }
        } as any, { onConflict: "email,tenant_id" })
        .select()
        .single();

      if (clientErr) throw clientErr;

      // 3. Create Order record
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          tenant_id: currentTenant?.id,
          client_id: client.id,
          product_id: product.id,
          amount: product.price,
          status: "pending",
          payment_status: "pending",
          partner_id: partnerId,
          metadata: {
            payment_method: paymentMethod
          }
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 4. Prepare Pagar.me Payload
      const pagarmePayload: any = {
        items: [
          {
            amount: Math.round(product.price * 100),
            description: product.name,
            quantity: 1,
            code: product.id
          }
        ],
        customer: {
          name: formData.name,
          email: formData.email,
          document: formData.cpf.replace(/\D/g, ""),
          type: "individual",
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: formData.phone.replace(/\D/g, "").substring(0, 2),
              number: formData.phone.replace(/\D/g, "").substring(2)
            }
          }
        },
        payments: [
          {
            payment_method: paymentMethod === "credit_card" ? "credit_card" : paymentMethod,
            [paymentMethod]: paymentMethod === "credit_card" ? {
              card: {
                number: formData.cardNumber.replace(/\D/g, ""),
                holder_name: formData.cardHolder,
                exp_month: parseInt(formData.cardExpiry.split("/")[0]),
                exp_year: parseInt(formData.cardExpiry.split("/")[1]),
                cvv: formData.cardCvv,
              },
              installments: 1,
              statement_descriptor: currentTenant?.trade_name?.substring(0, 13) || "ALLVITA"
            } : (paymentMethod === "pix" ? {
              expires_in: 3600 // 1 hour
            } : {
              expires_in: 86400 * 3 // 3 days
            })
          }
        ],
        code: order.id // Local Order UUID as Pagar.me code
      };

      // 5. Call Pagar.me Edge Function
      const { data: pagarmeResult, error: pagarmeErr } = await supabase.functions.invoke("pagarme-api", {
        body: {
          action: "create_order",
          params: pagarmePayload,
          tenant_id: currentTenant?.id,
          partner_id: partnerId
        }
      });

      if (pagarmeErr || pagarmeResult.error) {
        console.error("Pagarme error:", pagarmeErr || pagarmeResult.error);
        throw new Error("Erro ao processar pagamento com Pagar.me");
      }

      // 6. Handle Result
      setOrderResult(pagarmeResult);
      toast.success("Pedido gerado com sucesso!");
      
      // Update local order with external ID
      await supabase
        .from("orders")
        .update({ external_id: pagarmeResult.id })
        .eq("id", order.id);

    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Erro ao processar pedido");
    } finally {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  const tenantSecondary = currentTenant?.secondary_color || "#D97757";

  if (orderResult) {
    const isPix = orderResult.checkouts?.[0]?.payment_method === "pix" || orderResult.charges?.[0]?.last_transaction?.transaction_type === "pix";
    const pixData = orderResult.charges?.[0]?.last_transaction;
    const isBoleto = orderResult.charges?.[0]?.payment_method === "boleto";
    const boletoData = orderResult.charges?.[0]?.last_transaction;

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl overflow-hidden">
          <div className="bg-emerald-500 py-8 text-center text-white">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Pedido Recebido!</h1>
            <p className="opacity-90">Obrigado por sua compra.</p>
          </div>
          
          <CardContent className="pt-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Número do Pedido</p>
              <p className="text-xl font-mono font-bold">{orderResult.id}</p>
            </div>

            {isPix && pixData && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center">
                  <QrCode className="h-10 w-10 text-primary mb-2" />
                  <p className="font-bold text-primary">Pagamento via PIX</p>
                  <p className="text-xs text-muted-foreground mb-4">Escaneie o QR Code abaixo ou copie a chave</p>
                  
                  {pixData.qr_code_url && (
                    <img src={pixData.qr_code_url} alt="PIX QR Code" className="h-48 w-48 border rounded-lg bg-white p-2 mb-4" />
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qr_code);
                      toast.success("Código PIX copiado!");
                    }}
                  >
                    Copiar Código PIX
                  </Button>
                </div>
              </div>
            )}

            {isBoleto && boletoData && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-xl border flex flex-col items-center text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-bold">Pagamento via Boleto</p>
                  <p className="text-xs text-muted-foreground mb-4">Seu boleto foi gerado e enviado para seu e-mail.</p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: tenantSecondary }}
                  >
                    <a href={boletoData.pdf} target="_blank" rel="noopener noreferrer">
                      Visualizar Boleto
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {!isPix && !isBoleto && (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
                <BadgeCheck className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-900">Cartão Aprovado</p>
                  <p className="text-sm text-emerald-700">Seu acesso será enviado por e-mail em instantes.</p>
                </div>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
              Voltar para a Loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentTenant?.logo_url ? (
              <img src={currentTenant.logo_url} alt={currentTenant.trade_name} className="h-8 w-auto" />
            ) : (
              <span className="font-bold text-lg">{currentTenant?.trade_name}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Ambiente Seguro
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Pagar.me
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Identification */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-black/5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                    <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" name="name" placeholder="Como no documento" required onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="Para receber seu acesso" required onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" name="cpf" placeholder="000.000.000-00" required onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular (WhatsApp)</Label>
                    <Input id="phone" name="phone" placeholder="(00) 00000-0000" required onChange={handleInputChange} />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-black/5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                    <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" name="zipCode" placeholder="00000-000" required onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-4 space-y-2">
                    <Label htmlFor="street">Endereço</Label>
                    <Input id="street" name="street" required onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" name="number" required onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-4 space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" name="complement" placeholder="Apto, Bloco..." onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" name="neighborhood" required onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" name="city" required onChange={handleInputChange} />
                  </div>
                  <div className="sm:col-span-1 space-y-2">
                    <Label htmlFor="state">UF</Label>
                    <Input id="state" name="state" required onChange={handleInputChange} />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-black/5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                    <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Label
                      htmlFor="credit_card"
                      className={`flex flex-col items-center justify-center border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "credit_card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-black/5 hover:border-black/10"}`}
                    >
                      <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                      <CreditCard className={`h-6 w-6 mb-2 ${paymentMethod === "credit_card" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold">Cartão</span>
                    </Label>
                    
                    <Label
                      htmlFor="pix"
                      className={`flex flex-col items-center justify-center border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-black/5 hover:border-black/10"}`}
                    >
                      <RadioGroupItem value="pix" id="pix" className="sr-only" />
                      <QrCode className={`h-6 w-6 mb-2 ${paymentMethod === "pix" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold">PIX</span>
                    </Label>

                    <Label
                      htmlFor="boleto"
                      className={`flex flex-col items-center justify-center border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "boleto" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-black/5 hover:border-black/10"}`}
                    >
                      <RadioGroupItem value="boleto" id="boleto" className="sr-only" />
                      <FileText className={`h-6 w-6 mb-2 ${paymentMethod === "boleto" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold">Boleto</span>
                    </Label>
                  </RadioGroup>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "credit_card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Número do Cartão</Label>
                            <Input id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardHolder">Nome no Cartão</Label>
                            <Input id="cardHolder" name="cardHolder" placeholder="Como impresso no cartão" onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Validade</Label>
                            <Input id="cardExpiry" name="cardExpiry" placeholder="MM/AA" onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCvv">CVV</Label>
                            <Input id="cardCvv" name="cardCvv" placeholder="123" onChange={handleInputChange} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {paymentMethod === "pix" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3 overflow-hidden"
                      >
                        <QrCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-primary">Aprovação imediata</p>
                          <p className="text-muted-foreground mt-1">O código PIX será gerado após finalizar o pedido. Você terá 30 minutos para pagar.</p>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "boleto" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-muted/50 rounded-xl border border-border flex items-start gap-3 overflow-hidden"
                      >
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-semibold">Compensação em até 3 dias úteis</p>
                          <p className="mt-1">O boleto será gerado após a finalização. Você pode pagar em qualquer banco ou casa lotérica.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: tenantSecondary }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Finalizar Compra"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-black/5 shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Quantidade: 1</p>
                  <p className="text-sm font-semibold mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-emerald-600 font-medium">Grátis</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </span>
                </div>
                {paymentMethod === "credit_card" && (
                  <p className="text-[10px] text-muted-foreground text-right mt-1">
                    Até 12x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 12)}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 bg-muted/30 pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-600" />
                Sua compra está protegida
              </div>
              <div className="flex items-center gap-3 grayscale opacity-40">
                <BadgeCheck className="h-5 w-5" />
                <span className="text-[10px] font-bold tracking-widest uppercase">SSL SECURE</span>
              </div>
            </CardFooter>
          </Card>
          
          {referralCode && (
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-accent" />
              </div>
              <p className="text-[11px] text-accent leading-tight">
                Pedido vinculado à recomendação do parceiro <strong>{referralCode.toUpperCase()}</strong>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-black/5 text-center space-y-4">
        <p className="text-[11px] text-muted-foreground max-w-lg mx-auto px-4">
          All Vita Intermediação de Negócios LTDA. <br />
          CNPJ: 00.000.000/0001-00 <br />
          Ao finalizar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </footer>
    </div>
  );
};

export default Checkout;
