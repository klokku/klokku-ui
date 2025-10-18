export function WelcomeStep() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Welcome to Klokku Budget Wizard</h3>
      <p className="text-muted-foreground">
        Budgets help you plan how much time you want to dedicate to recurring activities each week. This quick
        wizard will help you set up common budgets like sleep and work, plus any other activities you do regularly.
      </p>
      <ul className="list-disc pl-6 text-muted-foreground">
        <li>Adjust time in hours and minutes</li>
        <li>Choose daily vs weekly amounts</li>
        <li>See planned vs remaining weekly time in real time</li>
      </ul>
    </div>
  );
}
