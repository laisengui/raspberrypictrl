let tmpl = `
<el-row :gutter="20" class="center">
    <el-col :span="14" :offset="4">
    <el-card class="box-card">
  <div slot="header" class="clearfix" style="text-align: center">
    <span>树莓派GPIO控制台{{version}}</span>
    <el-button @click="switchTask" style="float: right; padding: 3px 0;margin-left: 20px;"  plain>{{openTask?'停止跟踪':'每秒跟踪所有引脚'}}</el-button>
    <el-button @click="getAll" style="float: right; padding: 3px 0;margin-left: 20px;"  plain>获取所有状态</el-button>
    <el-button @click="clear" style="float: right; padding: 3px 0" type="warning" plain>清理资源</el-button>
  </el-switch>
  </div>
<el-table
:data="data"
border
:cell-class-name="cellCls"
:header-cell-class-name="headCls"
row-class-name="rowClz"
:cell-style="{padding:'2px'}"
>
<el-table-column
  prop="h"
  label="操作"
  width="300">
  <template slot-scope="scope" v-if="scope.row[0].type=='GPIO'">
    <el-switch
      :value="scope.row[0].val"
      @change="changeVal(scope.row[0])"
      active-color="red"
      active-text="高"
      inactive-text="低">
    </el-switch>
      <el-switch
      style="margin-left: 15px;"
      :value="scope.row[0].direction"
      @change="changeDirection(scope.row[0])"
      inactive-color="green"
      active-color="yellow"
      active-text="OUT"
      inactive-text="IN">
    </el-switch>
  </template>
</el-table-column>
<el-table-column
  prop="bcm"
  label="BCM编码"
  width="90">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[0].bcm }}</span>
  </template>
</el-table-column>

<el-table-column
  prop="name0"
  label="功能名"
  width="100">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[0].name }}</span>
  </template>
</el-table-column>

<el-table-column
  prop="physics"
  label="物理引脚编码"
  width="90">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[0].physics }}</span>
  </template>
</el-table-column>

<el-table-column
  prop="physics1"
  label="(BOARD)"
  width="90">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[1].physics }}</span>
  </template>
</el-table-column>

<el-table-column
  prop="name1"
  label="功能名"
  width="100">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[1].name }}</span>
  </template>
</el-table-column>

<el-table-column
  prop="bcm"
  label="BCM编码"
  width="90">
  <template slot-scope="scope">
    <span style="margin-left: 10px">{{ scope.row[1].bcm }}</span>
  </template>
</el-table-column>
<el-table-column
  prop="h"
  label="操作"
  width="300">
  <template slot-scope="scope" v-if="scope.row[1].type=='GPIO'">
      <el-switch
      :value="scope.row[1].direction"
      @change="changeDirection(scope.row[1])"
      inactive-color="green"
      active-color="yellow"
      active-text="OUT"
      inactive-text="IN">
    </el-switch>
    <el-switch
      style="margin-left: 15px;"
      :value="scope.row[1].val"
      @change="changeVal(scope.row[1])"
      active-color="red"
      active-text="高"
      inactive-text="低">
    </el-switch>
  </template>
</el-table-column>
</el-table>
</el-card>
</el-col>
</el-row>
`
import config from './config.js'
import {gpio} from './request.js'

export default {
  name: 'Config',
  template: tmpl,
  components: {},
  data() {
    return {
      config,
      // true代表树莓派5
      version:'',
      data:[],
      //物理引脚映射当前值,并不一定所有引脚都有当前值,请求到哪些算哪些
      physicsMap:{},
      openTask:false
    }
  },
  created() {
    let data=[]
     //默认 in为false out为true
     //低电平为false 高为true
     for(let r of config){
        data.push([{direction:false,val:false,...r[0]},{direction:false,val:false,...r[1]}])
      }
      this.data=data
    for(let r of data){
      this.physicsMap[r[0].physics]=r[0]
      this.physicsMap[r[1].physics]=r[1]
    }
    let query={method:'version'}
      gpio(query).then(response=>{
          if(response.data.code!=0){
            this.$message.error('发生错误!'+response.data.msg);
            return
          }
         this.version='('+response.data.data+')'
      })
  },
  computed:{

  },
  methods: {
    refresh(){
      let data=JSON.parse(JSON.stringify(this.data))
     //默认 in为false out为true
     //低电平为false 高为true
      this.data=data
      this.physicsMap={}
      for(let r of data){
        this.physicsMap[r[0].physics]=r[0]
        this.physicsMap[r[1].physics]=r[1]
      }
    },
    changeDirection(row){
      //传相反的
      let query={method:'writeDirection',number:row.physics,val:row.direction?'in':'out'}
      gpio(query).then(response=>{
        if(response.data.code!=0){
          this.$message.error('发生错误!'+response.data.msg);
          return
        }
        row.direction=response.data.data.trim()!='in'
        this.refresh()
      })
    },
    changeVal(row){
      let query={method:'write',number:row.physics,val:row.val?0:1}
      gpio(query).then(response=>{
        if(response.data.code!=0){
          this.$message.error('发生错误!'+response.data.msg);
          return
        }
        row.val=Number(String(response.data.data).trim())==1
        this.refresh()
      }).catch(e=>{
        console.log(e)
        this.$message.error('发生错误!');
      })
    },
    getAll(){
      let query={method:'all'}
      gpio(query).then(response=>{
        if(response.data.code!=0){
          this.$message.error('发生错误!'+response.data.msg);
          return
        }
        for(let v of response.data.data){
          this.physicsMap[v.physics].direction=v.direction.trim()!='in'
          this.physicsMap[v.physics].val=Number(String(v.val).trim())==1
        }
        this.refresh()
      }).catch(e=>{
        console.log(e)
        this.$message.error('发生错误!');
      })
    },
    // 清理export出的文件 
    clear(){
      let query={method:'clear',number:1}
      gpio(query).then(response=>{
        if(response.data.code!=0){
          this.$message.error('发生错误!'+response.data.msg);
          return
        }
          console.log(response)
          this.$message({
            message: '清理成功',
            type: 'success'
          });
      })
    },
    switchTask(){
      if(this.openTask){
        this.openTask=false
        return
      }
      this.openTask=true
      this.task()

    },
    task(){
      window.setTimeout(()=>{
        this.getAll()
        if(this.openTask){
          this.task()
        }
      },1000)
    },
    headCls(obj, o) {
      if (obj.column.property == 'bcm') {
        return "titleClz rp bcm"
      }
      if (obj.column.property == 'physics' ||obj.column.property == 'physics1') {
        return "titleClz rp physics"
      }
      return "titleClz"
    },
    cellCls(obj) {
      if (obj.column.property == 'bcm') {
        return "rp bcm"
      }
      if (obj.column.property == 'physics') {
        if(obj.row[0].val){
          return "rp physicsh"
        }
        return "rp physics"
      }
      if (obj.column.property == 'physics1') {
        if(obj.row[1].val){
          return "rp physicsh"
        }
        return "rp physics"
      }
      if (obj.column.property == 'name0') {
        return "rp " + obj.row[0].type
      }
      if (obj.column.property == 'name1') {
        return "rp " + obj.row[1].type
      }
    },
  }
}

