import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { Play, Pause, X, Settings, Check, BellRing, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const FocusTimer: React.FC = () => {
  const { 
    timerDuration, 
    timerRemaining, 
    timerActive, 
    setTimerDuration, 
    setTimerRemaining,
    startTimer,
    pauseTimer,
    resetTimer,
    currentTask
  } = useStore();
  
  const { toast } = useToast();
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showNotifications, setShowNotifications] = useState(true);
  const [playSound, setPlaySound] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer presets in minutes
  const presets = [
    { label: '25 分钟', value: 25 * 60 },
    { label: '15 分钟', value: 15 * 60 },
    { label: '45 分钟', value: 45 * 60 },
    { label: '自定义', value: 0 }
  ];
  
  const [selectedPreset, setSelectedPreset] = useState(0); // Default to 25 min
  
  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(timerRemaining - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerActive) {
      pauseTimer();
      
      // Notify user when timer completes
      if (showNotifications) {
        toast({
          title: "专注时间结束！",
          description: currentTask ? `你已完成了 "${currentTask.title}" 的专注时间` : "是时候休息一下了",
        });
      }
      
      // Play sound if enabled
      if (playSound && audioRef.current) {
        audioRef.current.play().catch(err => console.error("播放声音失败:", err));
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerRemaining, setTimerRemaining, pauseTimer, toast, showNotifications, playSound, currentTask]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = timerDuration > 0 ? (timerDuration - timerRemaining) / timerDuration * 100 : 0;
  
  // Handle preset selection
  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index);
    if (index === 3) { // Custom timer
      setShowCustomDialog(true);
      return;
    }
    
    const newDuration = presets[index].value;
    if (newDuration > 0) {
      setTimerDuration(newDuration);
      setTimerRemaining(newDuration);
    }
  };
  
  // Apply custom timer duration
  const applyCustomTimer = () => {
    const seconds = customMinutes * 60;
    setTimerDuration(seconds);
    setTimerRemaining(seconds);
    setShowCustomDialog(false);
  };
  
  // Gradient angle for visual effect
  const angle = 360 * (progress / 100);
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">专注计时器</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>计时器设置</DialogTitle>
              <DialogDescription>
                自定义专注计时器功能以适应你的工作习惯
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="notifications">完成提醒通知</Label>
                  <span className="text-xs text-muted-foreground">
                    当计时器完成时显示通知
                  </span>
                </div>
                <Switch
                  id="notifications"
                  checked={showNotifications}
                  onCheckedChange={setShowNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="sound">完成提示音</Label>
                  <span className="text-xs text-muted-foreground">
                    当计时器完成时播放提示音
                  </span>
                </div>
                <Switch
                  id="sound"
                  checked={playSound}
                  onCheckedChange={setPlaySound}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col items-center">
        {/* Timer Display with better visualization */}
        <div className="w-56 h-56 rounded-full border-8 border-neutral-200 flex items-center justify-center mb-6 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-primary/20"
            style={{
              background: `conic-gradient(var(--primary) ${angle}deg, transparent ${angle}deg)`,
            }}
          />
          <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center z-10">
            <div className="text-4xl font-bold text-neutral-800">
              {formatTime(timerRemaining)}
            </div>
            {currentTask && (
              <div className="text-xs text-neutral-500 mt-1 max-w-[120px] truncate text-center">
                {currentTask.title}
              </div>
            )}
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex space-x-4 mb-5">
          <Button 
            className={`rounded-full w-14 h-14 flex items-center justify-center ${timerActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-primary text-white hover:bg-primary/90'}`}
            onClick={timerActive ? pauseTimer : startTimer}
          >
            {timerActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="outline"
            className="bg-gray-100 text-gray-700 rounded-full w-14 h-14 flex items-center justify-center hover:bg-gray-200"
            onClick={resetTimer}
            disabled={!timerDuration || timerRemaining === timerDuration}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Timer Presets */}
        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((preset, index) => (
            <Button
              key={preset.label}
              variant={selectedPreset === index ? "default" : "outline"}
              className={`${
                selectedPreset === index
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-200 text-neutral-700"
              } px-4 py-2 rounded-full text-sm font-medium min-w-[80px]`}
              onClick={() => handlePresetSelect(index)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Custom Timer Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>自定义专注时间</DialogTitle>
            <DialogDescription>
              设置最适合你的专注时间长度
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="customMinutes">分钟</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <Slider
                    id="customMinutes"
                    min={1}
                    max={120}
                    step={1}
                    value={[customMinutes]}
                    onValueChange={(vals) => setCustomMinutes(vals[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                    min={1}
                    max={120}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <BellRing className="inline-block h-4 w-4 mr-1" />
              设置的专注时间将在每次计时结束后提醒你
            </div>
            
            <Button onClick={applyCustomTimer} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              设置专注时间
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Audio element for sound notification */}
      <audio ref={audioRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-217.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default FocusTimer;
