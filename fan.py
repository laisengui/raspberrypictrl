import time
import gpio

#风扇GPIO控制引脚(物理引脚)
FAN_GPIO = 12
#采样速度，单位为秒
SAMPLING = 1
#设定目标温度高于此就开启风扇
START_TEMP = 60
#设定目标温度低于此就关闭风扇
STOP_TEMP = 50


#读取CPU的温度值
def get_cpu_temp():
    with open('/sys/class/thermal/thermal_zone0/temp') as f:
        cpu_temp = int(f.read())
    return cpu_temp

def main():
    BCM_NUM=gpio.physics_to_bcm(FAN_GPIO)
    try:
        while 1:
            temp = get_cpu_temp()
            print('CPU Temperature:',temp)
            t=int(temp)/1000
            if t>START_TEMP:
                gpio.set_val(BCM_NUM,"1")
            if t<STOP_TEMP:
                gpio.set_val(BCM_NUM,"0")
                
            time.sleep(SAMPLING)
    except KeyboardInterrupt:
        pass
if __name__=='__main__':
    main()