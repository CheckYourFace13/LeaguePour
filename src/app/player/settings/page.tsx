import { Card } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PlayerSettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Account settings</h1>
        <p className="mt-2 text-lp-muted">Identity comes from your login — edits here ship next.</p>
      </div>
      <FieldHelp title="Venue + player">
        <p>One login can include venue staff access and a player profile. Use Account in the header to open dashboards.</p>
      </FieldHelp>
      <Card className="space-y-4">
        <div>
          <Label>Display name</Label>
          <Input className="mt-1.5" disabled placeholder="From your login" />
        </div>
        <Button disabled variant="secondary">
          Not editable yet
        </Button>
      </Card>
    </div>
  );
}
