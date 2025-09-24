import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Plus, TrendingUp, Eye } from "lucide-react";

const TokenBalance = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="bg-gradient-success border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Available Tokens</p>
              <p className="text-3xl font-bold">1,247</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Buy More Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tokens Earned Today</p>
              <p className="text-2xl font-bold text-success">+127</p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Goal</span>
              <span>127/200</span>
            </div>
            <Progress value={63.5} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Videos Watched</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <div className="bg-info/10 p-3 rounded-full">
              <Eye className="w-6 h-6 text-info" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Next reward in 7 more views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenBalance;