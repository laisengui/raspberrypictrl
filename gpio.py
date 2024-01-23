import os

version5=[0,0,0,0,0,0,0,403,0,0,0,416,417,426,0,421,422,0,423,0,0,0,424,0,0,0,0,0,0,404,0,405,411,412,0,418,415,425,419,0,420]
version4=[0,0,0,0,0,0,0,4,0,0,0,17,18,27,0,22,23,0,24,0,0,0,25,0,0,0,0,0,0,5,0,6,12,13,0,19,16,26,20,0,21]

#获取版本
def get_version():
    with open("/proc/cpuinfo", "r") as file:
        lines = file.readlines()
        r=lines[-1]
        v=r[r.find('Raspberry'):r.find("Rev")]
        return v
#判断是否树莓派5
def version_is5():
    return get_version().find('5')>-1

vvv= 5 if version_is5() else 4

def physics_to_bcm(physics):
    if physics is None:
        return physics
    if int(vvv)==5:
        return str(version5[int(physics)])
    return str(version4[int(physics)])

# 判断这个io口是否导出了
def export_over(number):
    return os.path.exists("/sys/class/gpio/gpio"+number)

# 导出IO口
def export_io(number):
    if export_over(number):
        return
    append_file("/sys/class/gpio/export",number)

#销毁IO口
def unexport_io(number):
    if not export_over(number):
        return
    append_file('/sys/class/gpio/unexport',number)

# 设置io口方向
def set_direction(number,d):
    export_io(number)
    append_file('/sys/class/gpio/gpio'+number+'/direction',d)
# 获取当前IO口方向
def get_direction(number):
    export_io(number)
    return read_file('/sys/class/gpio/gpio'+number+'/direction')
#读取IO口数值
def get_val(number):
    export_io(number)
    return read_file('/sys/class/gpio/gpio'+number+'/value')
#设置IO口数值
def set_val(number,val):
    export_io(number)
    append_file('/sys/class/gpio/gpio'+number+'/value',val)

# 一次性获取所有GPIO口的方向和当前值
def get_all():
    rst=[]
    v= version5 if vvv==5 else version4
    for i in range(len(v)):
        num=v[i]
        if num==0:
            continue
        val=get_val(str(num))
        d=get_direction(str(num))
        rst.append({'physics':i,'val':val,'direction':d})
    return rst

#获取当前所有export的IO口
def get_export_io_list():
    filelist = os.listdir('/sys/class/gpio')
    rst=[]
    for fname in filelist:
        if fname=='export' or fname=='unexport' or fname.startswith('gpiochip'):
            continue
        rst.append(fname)
    return rst


# 清理当前导出的所有IO文件
def clear_all_io():
    list=get_export_io_list
    for fname in list:
        unexport_io(fname[4:])

# 追加写入一次性字符串到文件
def append_file(path,txt):
    with open(path,'a') as exp:
        exp.write(txt)
# 一次性读取文件
def read_file(path):
    with open(path,'r') as exp:
        return exp.read()