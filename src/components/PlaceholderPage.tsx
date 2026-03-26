const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center">
    <div className="text-center">
      <h1 className="mb-2 text-display text-foreground">{title}</h1>
      <p className="text-body-lg text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default PlaceholderPage;
