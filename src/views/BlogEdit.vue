<template>
  <!--  <span>-->
  <!--    <el-input v-model="blogForm.title" placeholder="请键入标题" clearable input-style="text-align: center;">-->
  <!--      <template #prepend>-->
  <!--        <el-button @click="goHome">-->
  <!--          <el-icon>-->
  <!--            <HomeFilled/>-->
  <!--          </el-icon>-->
  <!--        </el-button>-->
  <!--      </template>-->
  <!--      <template #append>-->
  <!--        <el-button @click="submit">-->
  <!--          <el-icon>-->
  <!--            <Upload/>-->
  <!--          </el-icon>-->
  <!--        </el-button>-->
  <!--      </template>-->
  <!--    </el-input>-->
  <!--  </span>-->

  <!-- 标题栏 -->
  <el-input v-model="blogForm.title" placeholder="请键入标题" input-style="text-align: center;"></el-input>
  <!-- 工具栏和编辑器 -->
  <div style="border: 1px solid #ccc;height: calc( 100vh - 32px);display: flex;
      flex-direction: column;align-items: center;background-color: whitesmoke">
    <Toolbar
        style="border-bottom: 1px solid #ccc;width: 100vw"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 100vh; overflow-y: hidden; width: 70vw;"
        v-model="blogForm.content"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
    />
  </div>
  <!--  目录  -->
  <div class="lis" v-show="lisShow">
    <ul id="header-container">
      <li v-for="item in lis" :id="item.id" :type="item.type">{{ item.text }}</li>
    </ul>
  </div>
  <!-- 按钮组 -->
  <div class="btnGroup">
    <!--  上传按钮  -->
    <button class="btn" @click="submit">
      <i class="fa fa-arrow-up fa-2x"></i>
    </button>
    <!--  目录按钮  -->
    <button class="btn" id="lisBtn">
      <i class="fa fa-align-left fa-2x"></i>
    </button>
    <!--  返回按钮  -->
    <button class="btn" @click="goHome">
      <i class="fa fa-chevron-left fa-2x"></i>
    </button>
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, onMounted, ref, shallowRef} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {HomeFilled, Upload} from "@element-plus/icons-vue";
import {useRoute, useRouter} from 'vue-router';
import axios from "axios";
import {ElMessage} from "element-plus";
import {SlateNode} from "@wangeditor/editor";


export default {
  components: {Editor, Toolbar, Upload, HomeFilled},
  setup() {

    const router = useRouter();
    const route = useRoute()
    let id = route.query.id

    const myDate = new Date();

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    let valueHtml = ref('')

    const blogForm = ref({
      id: route.query.id,
      title: '',
      content: '',
      fromTime: myDate.toLocaleDateString(),
      toTime: myDate.toLocaleDateString(),
      userId: JSON.parse(sessionStorage.getItem("user") || "{}").id
    })

    const lisShow = ref(false)
    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        if (id !== '0') {
          getBlog(id)
        }
      }, 0)
      const lisBtn = document.getElementById("lisBtn")
      lisBtn.addEventListener("click", () => {
        lisShow.value = !lisShow.value
      })
    })

    const getBlog = (id) => {
      axios.get('/api/blog/select.do', {
        params: {
          id: id
        }
      }).then(res => {
        blogForm.value.title = res.data.data.title
        blogForm.value.content = res.data.data.content
      })
    }

    const submit = () => {
      if (blogForm.value.id === '0') {
        axios.post('/api/blog/insert.do', blogForm.value).then(res => {
          if (res.data.code === '0') {
            ElMessage.success("保存成功！")
            blogForm.value.id = res.data.data
          } else {
            ElMessage.error("保存失败！")
          }
        })
      } else {
        axios.post('/api/blog/update.do', blogForm.value).then(res => {
          if (res.data.code === '0') {
            ElMessage.success("更新成功！")
          } else {
            ElMessage.error("更新失败！")
          }
        })
      }
    }

    const goHome = () => {
      router.push('/')
    }

    const toolbarConfig = {}
    const editorConfig = {placeholder: '请输入内容...'}

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
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

    const lis = ref([])
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

    window.onbeforeunload = function () {
      return "确定退出？"
    }


    return {
      // title,
      blogForm,
      submit,
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
      goHome,
      lis,
      handleChange,
      lisShow
    };
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
  top: 80px;
  padding-left: 5px;
}

#header-container {
  list-style-type: none;
  overflow-y: hidden;
  height: calc(100vh - 100px);
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