<template>
  <div class="courseInfo">
    <!-- 按钮区域 -->
    <div class="head-btn">
      <Button type="primary" @click="show()">新增</Button>
      <Button @click="showCourseInfoImport" type="primary">导入</Button>
    </div>
    <!-- 表格区域 -->
    <div>
      <Table
        border
        :columns="columns"
        :data="courseInfo"
      ></Table>
      <!-- 分页 -->
      <Page
        @on-change="changePage"
        :total="page.totalNum"
        :current="page.pageNum"
        :page-size="page.pageSize"
        show-elevator
        show-total
        class="page"
      />
    </div>

    <!-- 新增与修改的对话框 -->
    <Modal
      v-model="showModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="modalClose"
    >
      <Form
        :model="data"
        :label-width="85"
        :rules="ruleValidate"
        ref="courseInfoRef"
      >
        <FormItem label="课程编号:" prop="courseNum">
          <Input
            v-model="data.courseNum"
            placeholder="请输入课程编号"
            maxlength="20"
            style="width: 240px"
          ></Input>
        </FormItem>
        <FormItem label="课程名称:" prop="courseName">
          <Input
            v-model="data.courseName"
            placeholder="请输入课程名称"
            maxlength="20"
            style="width: 240px"
          ></Input>
        </FormItem>
        <FormItem label="课程性质:">
          <Select v-model="data.courseNature" style="width: 240px">
            <Option value="必修">必修</Option>
            <Option value="选修">选修</Option>
          </Select>
        </FormItem>
        <FormItem label="考核方式:">
          <Select v-model="data.evaluationMode" style="width: 240px">
            <Option value="考试">考试</Option>
            <Option value="考试">考试</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: center">
        <Button @click="modalClose">取消</Button>
        <Button type="primary" @click="ok">保存</Button>
      </div>
    </Modal>

    <Modal
      v-model="importCourseInfoModal"
      :closable="true"
      :mask-closable="false"
      title="课程信息导入"
      width="400px"
      @on-cancel="importCourseInfoModalClose"
    >
      <div style="padding: 0 30px">
        <Upload
          ref="courseInfoUpload"
          :action="actionUrl"
          show-upload-list
          :format="['xls', 'xlsx']"
          style="padding-left: 20px"
        >
          <Button
            type="primary"
            ghost
            icon="ios-cloud-upload-outline"
            style="margin-left: 80px"
            >上传文件</Button
          >
        </Upload>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="importCourseInfoModalClose">取消</Button>
        <Button type="primary" @click="importCourseInfoModalClose"
          >确认导入</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  // 课程信息管理
  data() {
    return {
      // 验证规则
      ruleValidate: {
        courseNum: [
          {
            required: true,
            message: "课程编号不能为空",
            trigger: "blur",
          },
        ],
        courseName: [
          {
            required: true,
            message: "课程名称不能为空",
            trigger: "blur",
          },
        ],
      },
      // 新增与修改对话框绑定的数据
      data: {
        courseNum: "",
        courseName: "",
        courseNature: "必修",
        evaluationMode: "考试",
      },
      columns: [
        {
          title: "课程编号",
          key: "courseNum",
          align: "center",
          width: 202,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          width: 395,
        },
        {
          title: "课程性质",
          key: "courseNature",
          align: "center",
          width: 302,
        },
        {
          title: "考核方式",
          key: "evaluationMode",
          align: "center",
          width: 402,
        },
        {
          title: "操作",
          align: "center",
          width: 402,
          render: (h, params) => {
            return h("span", [
              h(
                "a",
                {
                  props: {},
                  style: {
                    marginRight: "22px",
                    color: "#1B81FF",
                  },
                  on: {
                    click: () => {
                      this.show(params.row);
                    },
                  },
                },
                "修改"
              ),
              h(
                "a",
                {
                  props: {},
                  style: {
                    color: "#FF7A7A",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      // 表格绑定的课程信息数据
      courseInfo: [],
      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },
      // 控制对话框的显示与隐藏
      showModal: false,

      title: "",
      // 控制导入对话框的显示与隐藏
      importCourseInfoModal: false,
      // 上传的地址
      actionUrl: "",
    };
  },
  mounted() {
    this.getCourseInfo();
  },
  methods: {
    // 请求课程信息
    getCourseInfo() {
      this.$axios.get("/api/json/courseInfo.json").then((res) => {
        console.log(res.data);
        this.courseInfo = res.data;
      });
    },
    // 改变页码
    changePage(i) {
      console.log(i);
    },
    // 打开导入的对话框
    showCourseInfoImport() {
      this.importCourseInfoModal = true;
    },
    // 关闭导入的对话框
    importCourseInfoModalClose() {
      this.importCourseInfoModal = false;
    },
    // 打开新增或修改对话框
    show(row) {
      if (row) {
        this.title = "修改课程信息";
        this.data.id = row.id;
        this.data.courseNum = row.courseNum;
        this.data.courseName = row.courseName;
        this.data.courseNature = row.courseNature;
        this.data.evaluationMode = row.evaluationMode;
      } else {
        this.title = "新增课程信息";
        this.data.id = "";
        this.data.courseNum = "";
        this.data.courseName = "";
      }
      this.showModal = true;
    },
    // 关闭新增或修改对话框
    modalClose() {
      this.showModal = false;
    },
    ok() {
      this.$refs["courseInfoRef"].validate((valid) => {
        if (!valid) {
          this.$Modal.error({
            title: "提示",
            content: "表单填写有误",
            closable: true,
          });
          return;
        }

        let data = {
          id: this.data.id,
          courseNum: this.data.courseNum,
          courseName: this.data.courseName,
          courseNature: this.data.courseNature,
          evaluationMode: this.data.evaluationMode,
        };
        console.log(data);
        this.modalClose();

        // 后端

        if (data.id) {
          let index = this.courseInfo.findIndex((item) => item.id == data.id);
          this.courseInfo.splice(index, 1);
          this.courseInfo.push(data);
        } else {
          this.courseInfo.push(data);
        }
      });
    },
    // 移除操作
    remove(row) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除 " + row.courseName + " 吗？",
        onOk: () => {
          let index = this.courseInfo.findIndex((item) => item.id == row.id);
          this.courseInfo.splice(index, 1);
        },
      });
    },
    headerClassName(row,index) {
      if (
        index === 1 ||
        index === 2 ||
        index === 3
      ) {
        return "table-head-style";
      }
    },
  },
};
</script>

<style>
.courseInfo {
  width: 100%;
  padding: 20px;
  height: 100%;
  background-color: #f3f8ff;
}
.courseInfo .head-btn {
  display: flex;
  justify-content: flex-end;
}
.courseInfo .ivu-btn {
  margin: 10px;
}
.courseInfo .page {
  float: right;
  margin-right: 17px;
  margin-top: 3px;
}

/* scoped 不能加scoped 否则改不了表格的表头样式 */
.courseInfo .ivu-table-header th{
  background-color:  #F0FAFF;
}
</style>