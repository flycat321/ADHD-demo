import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/store";
import { useCreateIdentityGroup } from "@/hooks/useIdentityGroups";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertIdentityGroupSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 扩展插入小圈子的schema，添加表单验证
const formSchema = insertIdentityGroupSchema.extend({
  name: z.string().min(2, "名称至少需要2个字符").max(50, "名称不能超过50个字符"),
  description: z.string().min(10, "描述至少需要10个字符").max(500, "描述不能超过500个字符"),
  identityTag: z.string().min(1, "身份标签不能为空").max(20, "身份标签不能超过20个字符"),
  rules: z.string().nullable().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function CreateGroup() {
  const [, navigate] = useLocation();
  const { currentUser } = useStore();
  const createGroup = useCreateIdentityGroup();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      identityTag: "",
      createdBy: currentUser?.id,
      avatarUrl: null,
      rules: "",
      isVerified: false,
      hasConsultant: false,
      consultantId: null
    }
  });
  
  const onSubmit = async (data: FormData) => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      await createGroup.mutateAsync({
        ...data,
        createdBy: currentUser.id
      });
      navigate("/groups");
    } catch (error) {
      console.error("创建小圈子失败:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">创建新的身份小圈子</h1>
      </div>
      
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>小圈子名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：ADHD艺术家联盟" {...field} />
                  </FormControl>
                  <FormDescription>
                    为你的小圈子起一个有吸引力的名称
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="identityTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>身份标签</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：艺术家、学生、程序员" {...field} />
                  </FormControl>
                  <FormDescription>
                    选择一个能代表这个小圈子成员身份的标签
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>小圈子描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="描述这个小圈子的目的、愿景和适合加入的人群" 
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    详细描述将帮助其他人了解并决定是否加入
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>小圈子规则（可选）</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="设置小圈子的基本规则和行为准则" 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    良好的规则有助于维持小圈子的健康发展
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>小圈子头像（可选）</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="输入图片URL，例如：https://example.com/image.jpg" 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    添加一个代表性的图像作为小圈子头像
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || createGroup.isPending}
              >
                {loading || createGroup.isPending ? "创建中..." : "创建小圈子"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}