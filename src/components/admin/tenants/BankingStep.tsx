import React from "react";
import { IMaskInput } from "react-imask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

const BANK_OPTIONS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica" },
  { code: "237", name: "Bradesco" },
  { code: "260", name: "Nu Pagamentos (Nubank)" },
  { code: "077", name: "Inter" },
  { code: "341", name: "Itaú" },
  { code: "336", name: "C6 Bank" },
  { code: "212", name: "Banco Original" },
  { code: "655", name: "Votorantim" },
  { code: "748", name: "Sicredi" },
  { code: "756", name: "Sicoob" },
  { code: "323", name: "Mercado Pago" },
  { code: "290", name: "PagSeguro" },
];

interface BankingStepProps {
  form: any;
  setForm: (updater: (f: any) => any) => void;
  onBack: () => void;
  onNext: () => void;
}

const BankingStep: React.FC<BankingStepProps> = ({ form, setForm, onBack, onNext }) => {
  const validate = () => {
    if (!form.legal_name?.trim()) return "Razão Social é obrigatória";
    if (!form.bank_code) return "Selecione o banco";
    if (!form.bank_agency) return "Informe a agência";
    if (!form.bank_account) return "Informe a conta";
    if (!form.bank_account_dv) return "Informe o dígito da conta";
    if (!form.bank_holder_name?.trim()) return "Informe o titular da conta";
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">Cadastro no Pagar.me</p>
          <p className="text-blue-800">
            Estes dados criam a conta de recebimento do tenant no Pagar.me. A análise (KYC) leva
            de <strong>1 a 3 dias úteis</strong>. Você será notificado quando a conta estiver liberada
            para receber pagamentos.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">
          Razão Social (espelha CNPJ)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <Label>Razão Social *</Label>
            <Input
              value={form.legal_name || form.name}
              onChange={(e) => setForm((f: any) => ({ ...f, legal_name: e.target.value }))}
              className="h-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">
          Conta Bancária para Recebimento
        </h3>
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-3 space-y-2">
            <Label>Banco *</Label>
            <Select
              value={form.bank_code}
              onValueChange={(v) => setForm((f: any) => ({ ...f, bank_code: v }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3 space-y-2">
            <Label>Tipo de Conta *</Label>
            <Select
              value={form.bank_account_type || "checking"}
              onValueChange={(v) => setForm((f: any) => ({ ...f, bank_account_type: v }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="conta_corrente_conjunta">Corrente Conjunta</SelectItem>
                <SelectItem value="conta_poupanca_conjunta">Poupança Conjunta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Agência *</Label>
            <Input
              value={form.bank_agency}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, bank_agency: e.target.value.replace(/\D/g, "") }))
              }
              maxLength={4}
              placeholder="0000"
              className="h-10"
            />
          </div>
          <div className="col-span-1 space-y-2">
            <Label>Dígito Ag.</Label>
            <Input
              value={form.bank_agency_dv}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, bank_agency_dv: e.target.value.replace(/\D/g, "") }))
              }
              maxLength={1}
              placeholder="0"
              className="h-10"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Conta *</Label>
            <Input
              value={form.bank_account}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, bank_account: e.target.value.replace(/\D/g, "") }))
              }
              placeholder="00000000"
              className="h-10"
            />
          </div>
          <div className="col-span-1 space-y-2">
            <Label>Dígito *</Label>
            <Input
              value={form.bank_account_dv}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, bank_account_dv: e.target.value.replace(/\D/g, "") }))
              }
              maxLength={2}
              placeholder="0"
              className="h-10"
            />
          </div>

          <div className="col-span-4 space-y-2">
            <Label>Nome do Titular *</Label>
            <Input
              value={form.bank_holder_name || form.legal_name || form.name}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, bank_holder_name: e.target.value }))
              }
              className="h-10"
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>CPF/CNPJ do Titular</Label>
            <IMaskInput
              mask={[
                { mask: "000.000.000-00" },
                { mask: "00.000.000/0000-00" },
              ]}
              value={form.bank_holder_document || form.cnpj || ""}
              unmask={true}
              onAccept={(value: string) =>
                setForm((f: any) => ({ ...f, bank_holder_document: value }))
              }
              placeholder="Mesmo CNPJ se vazio"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 h-14" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-[2] text-lg h-14"
          onClick={() => {
            const err = validate();
            if (err) {
              import("sonner").then(({ toast }) => toast.error(err));
              return;
            }
            onNext();
          }}
        >
          Próximo Passo: Identidade Visual
        </Button>
      </div>
    </div>
  );
};

export default BankingStep;
