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
        <div style="text-align: center">轮子制造师、CV工程师<br>要理解递归，首先要理解递归</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon学校.png')" alt="学校"/>武汉大学</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon地区.png')" alt="地区"/>湖北,武汉</div>
        <div class="icon-item"><img :src="require('../assets/home/Icon邮箱.png')" alt="邮箱"/>479763003@qq.com</div>
        <a class="icon-item" :href="githubUrl" target="_blank"><img :src="require('../assets/home/IconGithub.png')"
                                                                    alt="github"></a>
      </div>
      <!--   诗词板块   -->
      <div class="card-container" id="shici-card">
        {{ shici.content }}<br/>
        《{{ shici.title }}》<br/>
        {{ shici.author }}
      </div>
      <!--   访问板块   -->
<!--      <div class="card-container" id="count-card">-->
<!--        <span id="busuanzi_container_site_pv" style="display:none">本站总访问量<span id="busuanzi_value_site_pv"></span>次<span-->
<!--            class="post-meta-divider"></span></span>-->
<!--        <div>-->
<!--           <span id="busuanzi_container_site_uv" style="display:none">本站访客数<span-->
<!--               id="busuanzi_value_site_uv"></span>人</span>-->
<!--        </div>-->
<!--      </div>-->
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
      <!--   视频   -->
      <div class="card-container video-card">


        <div class="video-content">
          <video
              controls
              :src="currentVideo"
              id="video"
              class="screen"
          ></video>
        </div>
        <div class="video-list">
          <el-table v-loading="loading" :data="videos" style="width: 100%" :show-header="false" @row-click="changeVideo"
                    max-height="550">
            <el-table-column prop="name" min-width="100%"/>
            <el-table-column label="Operations" width="40">
              <template #default="scope">
                <img src="../assets/home/bilibili.png" style="width: 30px;position: absolute;left: 5px;top: 5px" @click="goBiliBili(scope.row.bilibiliUrl)">
              </template>
            </el-table-column>
          </el-table>
        </div>

      </div>
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
    const avatarUrl = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.zhimg.com%2F50%2Fv2-c2886eb2e2511cf0b9b9bd8293fe3cb3_hd.jpg&refer=http%3A%2F%2Fpic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1661710743&t=7a5d3e13fc378f21f7f060039c4ae4f0w"
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
    setTimeout(() => {
      userInfo.value = JSON.parse(sessionStorage.getItem("user"))
    }, 1000)

    let ap;
    const getMusic = (sever, type, id) => {
      axios.get('https://api.i-meto.com/meting/api?server=' + sever + '&type=' + type + '&id=' + id).then(
          (res) => {
            ap.list.add(res.data)
          }
      )
    }

    // 播放暂停
    function toggleVideoStatus() {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }

    // 更新播放暂停按钮
    function updatePlayIcon() {
      if (video.paused) {
        play.innerHTML = '<i class="fa fa-play fa-2x"></i>';
      } else {
        play.innerHTML = '<i class="fa fa-pause fa-2x"></i>';
      }
    }

    // 更新进度条和时间
    function updateProgress() {
      progress.value = (video.currentTime / video.duration) * 100;
      // 获取播放分钟
      let mins = Math.floor(video.currentTime / 60)
      if (mins < video.duration) {
        mins = '0' + String(mins)
      }
      // 获取播放秒数
      let secs = Math.floor(video.currentTime % 60)
      if (secs < video.duration) {
        secs = '0' + String(secs)
      }
      // 设置播放时间
      timestamp.innerHTML = `${mins}:${secs}`
    }

    // 设置播放进度
    function setVideoProgress() {
      video.currentTime = (+progress.value * video.duration) / 100;
    }

    // 停止播放
    function stopVideo() {
      video.currentTime = 0;
      video.pause();
    }

    const videos = [{
      name: "但盼风雨来,能留你在此。",
      videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=a7120bc7-88c7-414c-92a0-aa7713ce5d0a",
      bilibiliUrl: "https://www.bilibili.com/video/BV11x411N72J?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
    },
      {
        name: "CLANNAD ~Luv Letter~",
        videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=86454be4-4bff-4605-a4ec-92d00f9b9385",
        bilibiliUrl: "https://www.bilibili.com/video/BV1Fx411K7tj?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
      },
      {
        name: "风之明日",
        videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=c58d168b-43f6-49c7-9625-380bf60f6941",
        bilibiliUrl: "https://www.bilibili.com/video/BV1kx411A7cp?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
      },
      {
        name: "画中声",
        videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=853a99f0-e611-4163-ac3f-0af1d104ea17",
        bilibiliUrl: "https://www.bilibili.com/video/BV1ms411C7pm?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
      },
      {
        name: "LA LA LAND",
        videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=b4e17efc-c092-49cd-a832-34ca753bd035",
        bilibiliUrl: "https://www.bilibili.com/video/BV1XW41187RA?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
      },
      {
        name: "渺小的我们",
        videoUrl: "http://cloud.jollybottle.plus/api/doc/download.do?uuid=d6ee0f2c-ce54-42df-92dd-9168b26d0dba",
        bilibiliUrl: "https://www.bilibili.com/video/BV13741167ZP?spm_id_from=333.999.0.0&vd_source=80fddc9c3c4c66da5e176cf3888d6113"
      }
    ]

    let currentVideo = ref(videos[0].videoUrl)

    const changeVideo = (row) => {
      currentVideo.value = row.videoUrl
    }
    const goBiliBili = (bilibiliUrl) => {
      window.open(bilibiliUrl)
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
          // require("busuanzi.pure.js");
          const video = document.getElementById('video');
          video.addEventListener('canplay', () => {
            video.play()
          })
          // const play = document.getElementById('play');
          // const stop = document.getElementById('stop');
          // const progress = document.getElementById('progress');
          // const timestamp = document.getElementById('timestamp');
          // video.addEventListener('click', toggleVideoStatus);
          // video.addEventListener('pause', updatePlayIcon);
          // video.addEventListener('play', updatePlayIcon);
          // video.addEventListener('timeupdate', updateProgress);
          // play.addEventListener('click', toggleVideoStatus);
          // stop.addEventListener('click', stopVideo);
          // progress.addEventListener('change', setVideoProgress);
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
      userInfo,
      currentVideo,
      videos,
      changeVideo,
      goBiliBili
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
  padding: 10px 10px;
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

.screen {
  cursor: pointer;
  width: 100%;
  background-color: #000 !important;
  display: block;
  /*border-top-left-radius: 10px;*/
  /*border-top-right-radius: 10px;*/
}

.controls {
  background: #333;
  color: #fff;
  width: 100%;
  /*border-bottom-left-radius: 10px;*/
  /*border-bottom-right-radius: 10px;*/
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.controls .btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  margin-right: 5px;
}

.controls .fa-play {
  color: #28a745;
}

.controls .fa-stop {
  color: #dc3545;
}

.controls .fa-pause {
  color: #fff;
}

.controls .timestamp {
  color: #fff;
  font-weight: bold;
  margin-left: 10px;
}

.btn:focus {
  outline: 0;
}

input[type='range'] {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
}

input[type='range']:focus {
  outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
}

input[type='range']::-ms-track {
  width: 100%;
  cursor: pointer;
  /* Hides the slider so custom styles can be added */
  background: transparent;
  border-color: transparent;
  color: transparent;
}

/* Special styling for WebKit/Blink */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
}

/* All the same stuff for Firefox */
input[type='range']::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}

/* All the same stuff for IE */
input[type='range']::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}

input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}

input[type='range']:focus::-webkit-slider-runnable-track {
  background: #367ebd;
}

input[type='range']::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}

input[type='range']::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}

input[type='range']::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}

input[type='range']:focus::-ms-fill-lower {
  background: #3071a9;
}

input[type='range']::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}

input[type='range']:focus::-ms-fill-upper {
  background: #367ebd;
}

.video-card {
  display: flex;
}

.video-content {
  width: 80%;
}

.video-list {
  background-color: black;
  width: 20%;
}

:deep(.video-list .el-table) {
  color: white;
}

:deep(.video-list .el-table :hover) {
  color: black;
}

:deep(.video-list .el-table__row) {
  background-color: black;
}

:deep(.video-list .el-table__cell) {
  border-color: black;
}

:deep(.video-list .el-table__inner-wrapper::before) {
  background-color: black;
}

</style>