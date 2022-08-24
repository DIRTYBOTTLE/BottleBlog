<template>
  <!-- 内容区 -->
  <div style="display: flex;flex-direction: column;align-items: center;background-color: whitesmoke">
    <!--  标题  -->
    <h1 align="center">{{ title }}</h1>
    <!--  编辑器  -->
    <Editor
        style="height: calc(100vh - 46px); overflow-y: hidden; width: 70vw;"
        v-model="content"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
    />
  </div>
  <!--  目录  -->
  <div class="lis fade" id="lis">
    <ul id="header-container">
      <li v-for="item in lis" :id="item.id" :type="item.type">{{ item.text }}</li>
    </ul>
  </div>
  <!-- 按钮组 -->
  <div class="btnGroup">
    <!--  目录按钮  -->
    <button class="btn" id="lisBtn">
      <i class="fa fa-align-left fa-2x"></i>
    </button>
    <!--  编辑按钮  -->
    <button class="btn" v-show="editBtnShow" @click="goEdit">
      <i class="fa fa-pencil fa-2x"></i>
    </button>
    <!--  返回按钮  -->
    <button class="btn" @click="goHome">
      <i class="fa fa-chevron-left fa-2x"></i>
    </button>
  </div>
</template>

<script>
import {useRoute, useRouter} from 'vue-router'
import axios from "axios";
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, onMounted, ref, shallowRef} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {HomeFilled, Edit} from "@element-plus/icons-vue";
import {SlateNode} from '@wangeditor/editor'


export default {
  name: "BlogContent",
  components: {Editor, Toolbar, HomeFilled, Edit},
  setup() {
    const route = useRoute()
    const id = route.query.id;
    const title = ref("");
    const content = ref("");
    axios.get('/api/blog/select.do', {params: {id: id}})
        .then(res => {
          content.value = res.data.data.content
          title.value = res.data.data.title
        })

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('')

    const editorConfig = {}

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })


    const handleCreated = (editor) => {
      editor.disable()
      editorRef.value = editor // 记录 editor 实例，重要！
    }

    const lis = ref([])
    const lisShow = ref(false)
    const handleChange = (editor) => {
      lis.value = []
      const headers = editorRef.value.getElemsByTypePrefix('header')
      const headerContainer = document.getElementById('header-container')
      headerContainer.addEventListener('mousedown', event => {
        if (event.target.tagName !== 'LI') return
        event.preventDefault()
        const id = event.target.id
        editor.scrollToElem(id) // 滚动到标题
      })
      headers.map(header => {
        const text = SlateNode.string(header)
        const {id, type} = header
        lis.value.push({id, type, text})
      })
    }

    const router = useRouter();
    const goHome = () => {
      router.push('/')
    }

    const goEdit = () => {
      router.push('/blogedit?id=' + id)
    }

    let userInfo = ref(null)
    const editBtnShow = ref(false)
    setTimeout(() => {
      userInfo.value = JSON.parse(sessionStorage.getItem("user"))
      if (userInfo.value) {
        if (userInfo.value.id === 1) {
          editBtnShow.value = true
        }
      }
    }, 1000)

    onMounted(() => {
      const lisBtn = document.getElementById("lisBtn")
      lisBtn.addEventListener("click", () => {
        const lis = document.getElementById("lis")
        if (lis.classList.contains("fade")) {
          lis.classList.remove("fade")
        } else {
          lis.classList.add("fade")
        }
      })
    })

    return {
      title,
      content,
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      editorConfig,
      handleCreated,
      goHome,
      goEdit,
      handleChange,
      lis,
      userInfo,
      lisShow,
      editBtnShow
    }
  }
}
</script>

<style scoped>

.btnGroup {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.btnGroup .btn {
  background-color: rgba(255, 255, 255, 1);
  padding: 5px;
  cursor: pointer;
}

.btnGroup .btn:hover {
  background-color: #be2edd;
}

.lis {
  width: 215px;
  position: absolute;
  left: 0;
  top: 0;
  padding-left: 5px;
  /*animation-duration: 1s;*/
  /*animation-name: lisAni;*/
  transition: opacity 0.3s ease;
}

.lis.fade {
  /*animation-duration: 1s;*/
  /*animation-name: lisFadeAni;*/
  opacity: 0;
}

/*@keyframes lisAni {*/
/*  from {*/
/*    opacity: 0;*/
/*  }*/
/*  to {*/
/*    opacity: 1;*/
/*  }*/
/*}*/

/*@keyframes lisFadeAni {*/
/*  from {*/
/*    opacity: 1;*/
/*  }*/
/*  to {*/
/*    opacity: 0;*/
/*  }*/
/*}*/

#header-container {
  list-style-type: none;
  overflow-y: hidden;
  height: 100vh;
}

#header-container:hover {
  overflow-y: auto;
}

#header-container li {
  margin: 10px 0;
  cursor: pointer;
}

#header-container li:hover {
  text-decoration: underline;
}

#header-container li[type="header1"] {
  font-size: 16px;
  font-weight: bold;
  color: IndianRed;
}

#header-container li[type="header2"] {
  font-size: 14px;
  padding-left: 15px;
  font-weight: bold;
}

#header-container li[type="header3"] {
  font-size: 12px;
  padding-left: 30px;
}


</style>