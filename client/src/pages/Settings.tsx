import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, 
  Volume2, 
  Eye, 
  Shield, 
  Save,
  Check
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    verbosity: 'medium',
    language: 'en',
    ttsVoice: 'default',
    storeSelections: true,
    anonymizedFeedback: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your AlexiBot experience
          </p>
        </div>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              Preferences
            </CardTitle>
            <CardDescription>
              Adjust how AlexiBot analyzes and presents word information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="verbosity">Analysis Verbosity</Label>
                  <p className="text-sm text-muted-foreground">
                    How detailed should word explanations be?
                  </p>
                </div>
                <Select 
                  value={settings.verbosity} 
                  onValueChange={(value) => setSettings(s => ({ ...s, verbosity: value }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Default Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Language for translations and explanations
                  </p>
                </div>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings(s => ({ ...s, language: value }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text-to-Speech */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              Text-to-Speech
            </CardTitle>
            <CardDescription>
              Configure pronunciation and audio settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ttsVoice">Voice Selection</Label>
                <p className="text-sm text-muted-foreground">
                  Choose the voice for word pronunciations
                </p>
              </div>
              <Select 
                value={settings.ttsVoice} 
                onValueChange={(value) => setSettings(s => ({ ...s, ttsVoice: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="female-us">Female (US)</SelectItem>
                  <SelectItem value="male-us">Male (US)</SelectItem>
                  <SelectItem value="female-uk">Female (UK)</SelectItem>
                  <SelectItem value="male-uk">Male (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-muted-foreground" />
              Privacy Controls
            </CardTitle>
            <CardDescription>
              Manage your data and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="storeSelections">Store Text Selections</Label>
                <p className="text-sm text-muted-foreground">
                  Save your text selections for history and analytics
                </p>
              </div>
              <Switch
                id="storeSelections"
                checked={settings.storeSelections}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, storeSelections: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymizedFeedback">Anonymized Feedback</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve AlexiBot with anonymous usage data
                </p>
              </div>
              <Switch
                id="anonymizedFeedback"
                checked={settings.anonymizedFeedback}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, anonymizedFeedback: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} variant="hero">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
