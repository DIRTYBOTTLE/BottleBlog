<template>
  <!--  头部栏  -->
  <header>
    <h1>BottleBlog</h1>
    <p>光锥之内即命运</p>
  </header>
  <!-- 主体 -->
  <div id="main-container">
    <!--  左侧栏  -->
    <div id="left-side">
      <!--   个人简介   -->
      <div class="card-container" id="introduce-card">
        <img :src="avatarUrl" style="width: 100px" alt="头像"/>
        <b>DirtyBottle</b>
        <div style="text-align: center">轮子制造师、CV工程师</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon学校.png')" alt="学校"/>武汉大学</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon地区.png')" alt="地区"/>湖北,武汉</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon邮箱.png')" alt="邮箱"/>479763003@qq.com</div>
        <a class="icon-item" :href="githubUrl"><img :src="require('../assets/home/IconGithub.png')" alt="github"></a>
      </div>
      <!--   诗词板块   -->
      <div class="card-container" id="shici-card">
        {{ shici.content }}<br/>
        《{{ shici.title }}》<br/>
        {{ shici.author }}
      </div>
      <!--   访问板块   -->
      <div class="card-container" id="count-card">
        <span id="busuanzi_container_site_pv" style="display:none">本站总访问量<span id="busuanzi_value_site_pv"></span>次<span
            class="post-meta-divider"></span></span>
        <div>
           <span id="busuanzi_container_site_uv" style="display:none">本站访客数<span
               id="busuanzi_value_site_uv"></span>人</span>
        </div>
      </div>
    </div>
    <!--  内容区  -->
    <div id="right-side">
      <!--   文章   -->
      <div class="card-container">
        <b>文章</b>
        <el-button :icon="Edit" circle @click="goEdit('0')" style="position: absolute;right: 5px" v-if="userInfo"/>
        <el-table v-loading="loading" :data="blogs" style="width: 100%" :show-header="false" @row-click="goContent">
          <el-table-column prop="title" min-width="100%"/>
          <el-table-column prop="fromTime" width="100%"/>
          <el-table-column prop="toTime" width="100%"/>
          <el-table-column label="Operations" width="100%" v-if="userInfo">
            <template #default="scope">
              <el-button type="primary" :icon="Edit" circle @click="goEdit(scope.row.id)"/>
              <el-button type="danger" :icon="Delete" circle @click.stop="deleteBlog(scope.row.id)"/>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--   音乐   -->
      <div class="card-container" id="music-card"></div>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import * as jinrishici from "jinrishici"
import {Edit, Delete} from "@element-plus/icons-vue";
import router from "@/router";
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";
import APlayer from 'aplayer';
import 'aplayer/dist/APlayer.min.css';

export default {
  name: "BottleBlog",
  setup() {
    const avatarUrl = "https://avatars.githubusercontent.com/u/62377297?s=400&u=c09e0c16c7bc4fe961fb1738d5e42ad0a7cb4783&v=4"
    const githubUrl = "https://github.com/DIRTYBOTTLE"
    const shici = ref({})
    const loading = ref(true)
    const blogs = ref([])
    const getBlog = () => {
      fetch('/api/blog/list.do?userId=1').then(res => {
        res.json().then((json) => {
          blogs.value = json.data;
          loading.value = false
        })
      })
    }
    const deleteBlog = (id) => {
      ElMessageBox.confirm(
          '确认删除?',
          {
            confirmButtonText: '是的',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(() => {
        axios.get('/api/blog/delete.do', {
          params: {
            id: id
          }
        }).then(res => {
          if (res.data.code === '0') {
            getBlog()
            ElMessage.success("删除成功！")
          } else {
            ElMessage.error("删除失败！")
          }
        })
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: 'Delete canceled',
        })
      })
      // axios.get('/api/blog/delete.do', {
      //   params: {
      //     id: id
      //   }
      // }).then(res => {
      //   if (res.data.code === '0') {
      //     getBlog()
      //     ElMessage.success("删除成功！")
      //   } else {
      //     ElMessage.error("删除失败！")
      //   }
      // })
    }
    const goEdit = (id) => {
      router.push(`/blogedit?id=${id}`)
    }
    const goContent = (row) => {
      router.push(`/blogcontent?id=${row.id}`)
    }
    let userInfo = ref(null)
    setTimeout(()=>{
      userInfo.value = JSON.parse(sessionStorage.getItem("user"))
    },1000)

    let ap;
    const getMusic = (sever, type, id) => {
      axios.get('https://api.i-meto.com/meting/api?server=' + sever + '&type=' + type + '&id=' + id).then(
          (res) => {
            ap.list.add(res.data)
          }
      )
    }
    onMounted(() => {
          getBlog()
          ap = new APlayer({
            container: document.getElementById('music-card'),
          });
          getMusic('tencent', 'playlist', '1503048898')
          jinrishici.load(result => {
            shici.value.content = result.data.content
            shici.value.title = result.data.origin.title
            shici.value.author = result.data.origin.author
          });
          require("busuanzi.pure.js");
        }
    )
    return {
      avatarUrl,
      githubUrl,
      shici,
      Edit,
      Delete,
      loading,
      blogs,
      deleteBlog,
      goEdit,
      goContent,
      userInfo
    }
  }
}
</script>

<style scoped>
header {
  height: 12rem;
  background-position: center center;
  background-size: cover;
  background-image: url(https://api.ixiaowai.cn/gqapi/gqapi.php);
  color: #fff;
  font-size: 170%;
  padding: 40px 15px;
  text-shadow: 0 0 30px #000000FF;
  text-align: center;

}

header h1 {
  margin: 0;
}

header p {
  margin: 30px 0;
}

#main-container {
  background-color: gainsboro;
  display: flex;
}

#left-side {
  width: 25vw;
  display: flex;
  align-items: center;
  flex-direction: column;
}

#right-side {
  width: 75vw;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.card-container {
  width: 98%;
  background-color: white;
  margin: 10px 0 10px 0;
  padding: 5px 10px;
  line-height: 2rem;
  position: relative;
}

#introduce-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#shici-card {
  text-align: center;
}

#count-card {
  text-align: center;
}

.icon-item {
  display: flex;
  align-items: center;
}

.icon-item img {
  width: 20px;
  margin: 0 5px;
}

:deep(.el-table tr:hover) {
  cursor: pointer;
}

a:hover {
  color: gray;
}

a {
  text-decoration: none;
  color: gray;
  /*font-weight:bold;*/
}
</style>