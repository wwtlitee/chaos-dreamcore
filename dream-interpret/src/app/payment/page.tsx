"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<"alipay" | "wechat" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    // TODO: 调用支付API
    console.log("支付方式:", selectedMethod);
    
    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card className="classical-card">
              <CardHeader>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl">支付成功</CardTitle>
                <CardDescription>
                  您已成功购买一次解梦服务
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">服务类型</span>
                    <span className="font-medium">AI解梦服务</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">支付金额</span>
                    <span className="font-medium text-primary">¥9.90</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">订单号</span>
                    <span className="font-medium text-sm">DM20260622001</span>
                  </div>
                </div>
                
                <Separator className="classical-divider" />
                
                <p className="text-sm text-muted-foreground">
                  您现在可以使用一次AI解梦服务，解梦结果将保存在您的历史记录中。
                </p>
                
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/dream"
                    className="classical-button inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium"
                  >
                    立即使用解梦服务
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                  >
                    返回首页
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dream"
              className="mb-4 inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              返回解梦
            </Link>
            <Badge variant="secondary" className="classical-badge mb-4">
              按次收费
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              购买解梦服务
            </h1>
            <p className="text-muted-foreground">
              选择支付方式，购买一次AI解梦服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Payment Options */}
            <div className="md:col-span-2">
              <Card className="classical-card">
                <CardHeader>
                  <CardTitle>选择支付方式</CardTitle>
                  <CardDescription>
                    请选择您偏好的支付方式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Alipay */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMethod === "alipay"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMethod("alipay")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">支付宝</h3>
                        <p className="text-sm text-muted-foreground">
                          使用支付宝扫码支付
                        </p>
                      </div>
                      {selectedMethod === "alipay" && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* WeChat Pay */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMethod === "wechat"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMethod("wechat")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">微信支付</h3>
                        <p className="text-sm text-muted-foreground">
                          使用微信扫码支付
                        </p>
                      </div>
                      {selectedMethod === "wechat" && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="classical-card sticky top-24">
                <CardHeader>
                  <CardTitle>订单详情</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI解梦服务</span>
                      <span>¥9.90</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">数量</span>
                      <span>1次</span>
                    </div>
                  </div>
                  
                  <Separator className="classical-divider" />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>总计</span>
                    <span className="text-primary">¥9.90</span>
                  </div>
                  
                  <Button
                    className="w-full classical-button"
                    disabled={!selectedMethod || isProcessing}
                    onClick={handlePayment}
                  >
                    {isProcessing ? "处理中..." : "立即支付"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    支付即表示您同意{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      服务条款
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
