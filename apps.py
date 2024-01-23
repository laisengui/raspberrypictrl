from http.server import SimpleHTTPRequestHandler,HTTPServer
from urllib.parse import urlparse,parse_qs
import json
from sys import argv
import gpio
import traceback
class RequestHandler(SimpleHTTPRequestHandler):
  def do_GET(self):
    print('请求路径',self.path)
    #重定向
    if self.path =='/':
      self.redirect('/static/index.html')
      return
    #静态文件
    if self.path.startswith('/static'):
      SimpleHTTPRequestHandler.do_GET(self)
      return
  
  # 获取参数值
    query=parse_qs(urlparse(self.path).query)
    print("所有参数",query)
    method=self.get_val(query,'method')
    try:
      result=self.method_handle(method,query)
      if result is None:
        self.retJson('',404,'no handler method')
        return 
      self.retJson(result,0,'')
    except Exception as e:
      traceback.print_exc()
      self.retJson('',500,e.args)
      return 
    else:
      return 
  #获取参数
  def get_val(self,query,key):
    val=query.get(key)
    if val is None:
      return val
    return val[0]  

  #主要处理
  def method_handle(self,method,query):
    if method is None:
      return None
    if method=='all':
      return gpio.get_all()
    if method=='clear':
      return "clear over"
    if method=='version':
      return gpio.get_version()

    number=gpio.physics_to_bcm(self.get_val(query,'number'))
    print("转换BCM:%d",number)
    if method=='read':
      return gpio.get_val(number)
    
    if method=='readDirection':
      return gpio.get_direction(number)
    val=self.get_val(query,'val')
    if method=='write':
      gpio.set_val(number,val)
      return gpio.get_val(number)
    if method=='writeDirection':
      gpio.set_direction(number,val)
      return gpio.get_direction(number)
    
    return None
  # 渲染返回
  def retJson(self,data,code,msg):
    wrap={'code':code,'msg':msg,'data':data}
    self.send_response(200) #响应码
    self.send_header('Content-type','application/json')
    self.end_headers() #空行
    self.wfile.write(bytes(json.dumps(wrap),"utf-8")) #json.load(xxx)
  #重定向
  def redirect(self,url):
    self.send_response(301) #响应码
    self.send_header('Location',url)
    self.end_headers() #空行

# 操作gpio  
class GPIO:
  def GET(self):
    form=web.input()
    method=form.method
    print("当前请求:")
    print(form)
    
    if method=='all':
      return gpio.get_all()
    if method=='clear':
      return "clear over"
    if method=='version':
      return gpio.get_version()

    number=gpio.physics_to_bcm(form.number)
    print("转换BCM:%d",number)
    if method=='read':
      return gpio.get_val(number)
    if method=='write':
      gpio.set_val(number,form.val)
      return gpio.get_val(number)
    if method=='readDirection':
      return gpio.get_direction(number)
    if method=='writeDirection':
      gpio.set_direction(number,form.val)
      return gpio.get_direction(number)
    
    return "invalid method"
    
# 在应用程序启动时执行的初始化操作
def init_app():
    #blog_views.init_views(app)
  print("init")

# 在应用程序关闭时执行的清理操作
def cleanup_app():
    #blog_views.cleanup_views(app)
  print("clean")

if __name__ == "__main__":
  #启动HTTP服务器
  print(argv)
  port=8080
  if len(argv)==2:
    port=int(argv[1])
  server_address = ('',port)
  httpd = HTTPServer(server_address , RequestHandler)
  print("服务已开启...")
  httpd.serve_forever()
