<template>
  <div class="courseTransferReview">
    <ButtonGroup>
      <Button
        v-for="(item, index) in btn"
        :key="index"
        :type="activeIndex == index ? 'primary' : 'default'"
        @click="changeBtn(index)"
        >{{ item }}</Button
      >
    </ButtonGroup>

    <div class="content">
      <!-- 表格区域 -->
      <div>
        <Table
          border
          :columns="courseTransferColumns"
          :data="courseTransferTable"
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
    </div>

    <!-- 详情的弹窗 -->
    <Modal
      v-model="detailsModal"
      title="调课申请详情"
      @on-cancel="detailsCancel"
      :mask-closable="false"
      :closable="true"
    >
      <div style="display:flex; justify-content: center;">
        <List border size="small">
          <ListItem>教师： {{ detailsList.teaching_teacher }}</ListItem>
          <ListItem>班级： {{ detailsList.teaching_class }}</ListItem>
          <ListItem>课程： {{ detailsList.course_name }}</ListItem>
          <ListItem>周次： {{ detailsList.weekly }}</ListItem>
          <ListItem>星期： {{ detailsList.week }}</ListItem>
          <ListItem>节次： {{ detailsList.section }}</ListItem>
          <ListItem>教室： {{ detailsList.classroom }}</ListItem>
        </List>
        <div style="margin: 8px; color: #04be02">
          {{ detailsToList.change_type }}
        </div>
        <List border size="small" v-if="detailsToList.change_type != '新增'">
          <ListItem>教师： {{ detailsToList.to_teaching_teacher }}</ListItem>
          <ListItem>班级： {{ detailsToList.to_teaching_class }}</ListItem>
          <ListItem>课程： {{ detailsToList.to_course_name }}</ListItem>
          <ListItem>周次： {{ detailsToList.to_weekly }}</ListItem>
          <ListItem>星期： {{ detailsToList.to_week }}</ListItem>
          <ListItem>节次： {{ detailsToList.to_section }}</ListItem>
          <ListItem>教室： {{ detailsToList.to_classroom }}</ListItem>
        </List>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="detailsCancel">取消</Button>
        <Button
          type="primary"
          @click="pass(curCourseTransferRow)"
          v-if="activeIndex == 0"
          >通过</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 按钮组
      btn: ["待审核", "审核通过", "退回"],
      // 用于控制选择了那个按钮
      activeIndex: 0,

      courseTransferColumns: [
        {
          title: "审核状态",
          align: "center",
          minWidth: 152,
          render: (h, params) => {
            // 根据条件判断内容重写
            switch (params.row.status) {
              case 0:
                return h("span", "待系部审核");
              case 1:
                return h("span", "审核通过");
              case 2:
                return h("span", "退回");
            }
          },
        },
        {
          title: "周次",
          align: "center",
          key: "cycle",
          minWidth: 102,
        },
        {
          title: "星期",
          align: "center",
          key: "week",
          minWidth: 102,
        },
        {
          title: "节次",
          align: "center",
          key: "section",
          minWidth: 102,
        },
        {
          title: "课室",
          align: "center",
          key: "classroom",
          minWidth: 102,
        },
        {
          title: "班级名称",
          key: "className",
          align: "center",
          minWidth: 182,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          minWidth: 182,
        },
        {
          align: "center",
          minWidth: 125,
          key: "applicationType",
          className: "applicationTypeStyle",
        },
        {
          title: "周次",
          key: "to_cycle",
          align: "center",
          minWidth: 102,
        },
        {
          title: "星期",
          key: "to_week",
          align: "center",
          minWidth: 102,
        },
        {
          title: "节次",
          key: "to_section",
          align: "center",
          minWidth: 102,
        },
        {
          title: "课室",
          key: "to_classroom",
          align: "center",
          minWidth: 122,
        },
        {
          title: "操作",
          align: "center",
          minWidth: 200,
          render: (h, params) => {
            if (this.activeIndex == 0) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                    },
                    style: {
                      marginRight: "15px",
                    },
                    on: {
                      click: () => {
                        this.showDetailsModal(params.row);
                      },
                    },
                  },
                  "详情"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                    },
                    style: {
                      marginRight: "15px",
                    },
                    on: {
                      click: () => {
                        this.pass(params.row);
                      },
                    },
                  },
                  "通过"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                    },
                    on: {
                      click: () => {
                        this.sendBack(params.row);
                      },
                    },
                  },
                  "退回"
                ),
              ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                    },
                    on: {
                      click: () => {
                        this.showDetailsModal(params.row);
                      },
                    },
                  },
                  "详情"
                ),
              ]);
            }
          },
        },
      ],
      // 待审核表格绑定的数据
      courseTransferTable: [],
      // 当前点击详情的项
      curCourseTransferRow: {},

      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },
      // 控制详情弹窗的显示与隐藏
      detailsModal: false,

      // 详情对话框的数据
      detailsList: {
        teaching_teacher: "",
        teaching_class: "",
        course_name: "",
        weekly: "",
        week: "",
        section: "",
        classroom: "",
      },
      detailsToList: {
        change_type: "",
        to_teaching_teacher: "",
        to_teaching_class: "",
        to_course_name: "",
        to_weekly: "",
        to_week: "",
        to_section: "",
        to_classroom: "",
      },

      // 模拟数据
      courseTransferTable2: [
        {
          id: 1,
          status: 0, //审核状态
          teaching_teacher: "于老师", //授课老师
          className: "软件工程1班", //班级名称
          courseName: "软件工程", //课程名称
          cycle: "第一周", //周次
          week: "星期一", //星期
          section: "第1、2节", //节次
          classroom: "信息楼201", //课室

          applicationType: "调至", //申请类型
          to_teaching_teacher: "张老师", //授课老师
          to_cycle: "第一周", //周次
          to_week: "星期二", //星期
          to_section: "第1、2节", //节次
          to_classroom: "信息楼201", //课室
        },
        {
          id: 2,
          status: 0, //审核状态
          teaching_teacher: "于老师", //授课老师
          className: "软件工程1班", //班级名称
          courseName: "软件工程", //课程名称
          cycle: "第一周", //周次
          week: "星期一", //星期
          section: "第1、2节", //节次
          classroom: "信息楼201", //课室

          applicationType: "调至", //申请类型
          to_teaching_teacher: "张老师", //授课老师
          to_cycle: "第一周", //周次
          to_week: "星期二", //星期
          to_section: "第1、2节", //节次
          to_classroom: "信息楼201", //课室
        },
        {
          id: 3,
          status: 0, //审核状态
          className: "软件工程1班", //班级名称
          courseName: "软件工程", //课程名称
          cycle: "第一周", //周次
          week: "星期一", //星期
          section: "第1、2节", //节次
          classroom: "信息楼201", //课室
          applicationType: "新增", //申请类型

          to_cycle: "/", //周次
          to_week: "/", //星期
          to_section: "/", //节次
          to_classroom: "/", //课室
        },
      ],
    };
  },
  methods: {
    // 改变页码
    changePage(i) {
      console.log(i);
    },
    // 获取调课申请信息 待审核
    getCourseTransferData() {
      this.courseTransferTable = this.courseTransferTable2;
      this.changeBtn(0);

      // 请求后端
    },
    // 切换btn
    changeBtn(index) {
      this.activeIndex = index;
      let list = [];
      this.courseTransferTable2.forEach((item) => {
        if (item.status == this.activeIndex) {
          list.push(item);
        }
      });
      this.courseTransferTable = list;
    },
    // 打开详情弹窗
    showDetailsModal(row) {
      console.log(row);
      this.curCourseTransferRow = row;

      this.detailsList.teaching_teacher = row.teaching_teacher;
      this.detailsList.teaching_class = row.className;
      this.detailsList.course_name = row.courseName;
      this.detailsList.weekly = row.cycle;
      this.detailsList.week = row.week;
      this.detailsList.section = row.section;
      this.detailsList.classroom = row.classroom;

      this.detailsToList.change_type = row.applicationType;

      this.detailsToList.to_teaching_teacher = row.to_teaching_teacher;
      this.detailsToList.to_teaching_class = row.className;
      this.detailsToList.to_course_name = row.courseName;
      this.detailsToList.to_weekly = row.to_cycle;
      this.detailsToList.to_week = row.to_week;
      this.detailsToList.to_section = row.to_section;
      this.detailsToList.to_classroom = row.to_classroom;

      this.detailsModal = true;
    },
    // 关闭详情弹窗
    detailsCancel() {
      this.detailsModal = false;
    },

    ok() {},

    // 通过操作
    pass(row) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定通过吗？",
        onOk: () => {
          this.detailsCancel();

          // 请求后端
          let index = this.courseTransferTable2.findIndex(
            (item) => item.id == row.id
          );
          this.courseTransferTable2[index].status = 1;
          this.changeBtn(row.status);
        },
      });
    },

    // 退回操作
    sendBack(row) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定退回吗？",
        onOk: () => {
          // 请求后端
          let index = this.courseTransferTable2.findIndex(
            (item) => item.id == row.id
          );
          this.courseTransferTable2[index].status = 2;
          this.changeBtn(row.status);
        },
      });
    },
  },
  mounted() {
    this.getCourseTransferData();
    console.log(this.courseTransferTable);
  },
};
</script>

<style>
.courseTransferReview {
  width: 100%;
  padding: 20px 80px 0;
  height: 100%;
  background-color: #f3f8ff;
}

.courseTransferReview .content {
  margin-top: 24px;
  padding: 24px;
  height: 754px;
  background-color: #fff;
}

.courseTransferReview .content .page {
  text-align: center;
  margin-top: 39px;
}

.ivu-table td.applicationTypeStyle {
  color: #04be02;
}

.courseTransferReview .ivu-table-header th {
  background-color: #f0faff;
}
</style>
