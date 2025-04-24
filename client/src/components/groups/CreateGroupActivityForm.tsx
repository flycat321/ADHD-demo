import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "@/store";
import { useCreateGroupActivity } from "@/hooks/useIdentityGroups";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CreateGroupActivityFormProps {
  groupId: number;
  onSuccess?: () => void;
}

// 活动表单验证架构
const formSchema = z.object({
  title: z.string().min(2, "标题至少需要2个字符").max(100, "标题不能超过100个字符"),
  description: z.string().min(10, "描述至少需要10个字符").max(500, "描述不能超过500个字符"),
  activityDate: z.date({
    required_error: "请选择活动日期",
  }),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  participantLimit: z.coerce.number().int().min(0, "参与人数不能为负数").default(0),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateGroupActivityForm({ groupId, onSuccess }: CreateGroupActivityFormProps) {
  const { currentUser } = useStore();
  const createActivity = useCreateGroupActivity(groupId);
  const [isVirtual, setIsVirtual] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isVirtual: false,
      participantLimit: 0,
    },
  });
  
  const onSubmit = async (data: FormData) => {
    if (!currentUser?.id) return;
    
    try {
      await createActivity.mutateAsync({
        groupId,
        title: data.title,
        description: data.description,
        activityDate: data.activityDate,
        location: data.location || null,
        isVirtual: data.isVirtual,
        participantLimit: data.participantLimit,
        createdBy: currentUser.id,
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("创建活动失败:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>活动标题</FormLabel>
              <FormControl>
                <Input placeholder="例如：ADHD经验分享交流会" {...field} />
              </FormControl>
              <FormDescription>
                简洁明了的标题有助于吸引更多成员参与
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
              <FormLabel>活动描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="详细描述活动的内容、目的和适合参与的人群"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                包含活动流程、收获和注意事项等信息
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="activityDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>活动日期</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy年MM月dd日")
                      ) : (
                        <span>选择日期</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                活动日期必须是当前日期之后
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isVirtual"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsVirtual(checked === true);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  线上活动
                </FormLabel>
                <FormDescription>
                  勾选此项表示这是一个线上虚拟活动
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isVirtual ? "线上会议链接" : "活动地点"}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={isVirtual ? "例如：腾讯会议ID或Zoom链接" : "例如：北京市海淀区中关村南大街5号"} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {isVirtual 
                  ? "提供参与线上活动的链接或ID" 
                  : "尽量提供详细的地址信息，方便成员找到活动地点"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="participantLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>参与人数限制</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="0表示不限制人数" 
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              </FormControl>
              <FormDescription>
                设置为0表示不限制参与人数
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={createActivity.isPending}
        >
          {createActivity.isPending ? "创建中..." : "创建活动"}
        </Button>
      </form>
    </Form>
  );
}