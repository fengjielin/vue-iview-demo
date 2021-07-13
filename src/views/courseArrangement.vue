<template>
  <div class="courseArrangement">
    <ButtonGroup>
      <Button
        v-for="(item, index) in btn"
        :key="index"
        :type="activeIndex == index ? 'primary' : 'default'"
        @click="activeIndex = index"
        >{{ item }}</Button
      >
    </ButtonGroup>

    <div class="content" v-if="activeIndex == 0">
      <!-- 按钮区域 -->
      <div class="head-btn">
        <Button type="primary" @click="showTimeSet()">新增</Button>
      </div>
      <!-- 表格区域 -->
      <div>
        <Table border :columns="timeSetColumns" :data="timeSetTable"></Table>
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

    <div class="content" v-else>
      <!-- 按钮区域 -->
      <div class="head-btn">
        <Button type="primary" @click="showSiteSet()">新增</Button>
        <Button type="primary" @click="showSiteSet()">导入</Button>
      </div>
      <!-- 表格区域 -->
      <div>
        <Table border :columns="siteSetColumns" :data="siteSetTable"></Table>
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

    <!-- 时间设置 新增与修改的对话框 -->
    <Modal
      v-model="showTimeSetModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="timeSetModalClose"
    >
      <Form
        :model="timeSetData"
        :label-width="85"
        :rules="ruleValidate"
        ref="timeSetRef"
      >
        <FormItem label="适用范围:">
          <Select v-model="timeSetData.applicationAange" style="width: 240px">
            <Option value="全校">全校</Option>
            <Option value="计算机系">计算机系</Option>
            <Option value="美容美发系">美容美发系</Option>
          </Select>
        </FormItem>
        <FormItem label="时间类型:">
          <RadioGroup v-model="timeSetData.timeType">
            <Radio label="星期"></Radio>
            <Radio label="日期"></Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="时间范围">
          <CheckboxGroup
            v-model="timeSetData.timeRange"
            v-if="timeSetData.timeType == '星期'"
          >
            <Checkbox
              :label="item"
              v-for="(item, index) in timeRangeArr"
              :key="index"
            ></Checkbox>
          </CheckboxGroup>
          <DatePicker
            type="daterange"
            v-model="timeSetData.timeDateRange"
            placement="bottom-end"
            placeholder="请选择"
            style="width: 200px"
            v-else
          ></DatePicker>
        </FormItem>
        <FormItem label="节次:">
          <CheckboxGroup v-model="timeSetData.section">
            <Checkbox
              :label="item"
              v-for="(item, index) in sectionArr"
              :key="index"
            ></Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="是否生效:">
          <RadioGroup v-model="timeSetData.isValid">
            <Radio label="是"></Radio>
            <Radio label="否"></Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="备注:">
          <Input
            type="textarea"
            v-model="timeSetData.remark"
            placeholder="请输入备注"
            maxlength="20"
            style="width: 240px"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: center">
        <Button @click="timeSetModalClose">取消</Button>
        <Button type="primary" @click="timeSetModalClose">保存</Button>
      </div>
    </Modal>

    <!-- 场地设置 新增与修改的对话框 -->
    <Modal
      v-model="showSiteSetModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="siteSetModalClose"
    >
      <Form
        :model="siteSetData"
        :label-width="85"
        :rules="ruleValidate"
        ref="siteSetRef"
      >
        <FormItem label="教室:">
          <Select v-model="siteSetData.classroom" style="width: 240px">
            <Option value="全校">全校</Option>
            <Option value="院系">院系</Option>
          </Select>
        </FormItem>
        <FormItem label="院系:">
          <Select v-model="siteSetData.yxName" style="width: 240px">
            <Option value="/">/</Option>
            <Option value="计算机系">计算机系</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: center">
        <Button @click="siteSetModalClose">取消</Button>
        <Button type="primary" @click="siteSetModalClose">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 按钮组
      btn: ["时间设置", "场地设置"],
      // 用于控制选择了那个按钮
      activeIndex: 0,

      // 验证规则
      ruleValidate: {},

      timeSetColumns: [
        {
          title: "适用范围",
          key: "applicationAange",
          align: "center",
        },
        {
          title: "所属院系",
          key: "yxName",
          align: "center",
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
        },
        {
          title: "时间",
          key: "time",
          align: "center",
        },
        {
          title: "节次",
          key: "section",
          align: "center",
        },
        {
          title: "是否生效",
          key: "isValid",
          align: "center",
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
                      this.showTimeSet(params.row);
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
                      this.removeTimeSet(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      // 时间设置表格绑定数据
      timeSetTable: [],

      // 时间设置 新增与修改绑定的数据
      timeSetData: {
        applicationAange: "",
        remark: "",
        timeType: "星期",
        timeRange: [],
        timeDateRange:[],
        section: [],
        isValid:'是'
      },

      // 星期范围数组
      timeRangeArr: [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日",
      ],
      // 节次数组
      sectionArr: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节"],

      siteSetColumns: [
        {
          title: "教室",
          key: "classroom",
          align: "center",
        },
        {
          title: "院系",
          key: "faculty",
          align: "center",
        },
        {
          title: "是否生效",
          key: "isValid",
          align: "center",
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
                      this.showSiteSet(params.row);
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
                      this.removeSiteSet(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      // 场地设置表格绑定数据
      siteSetTable: [],
      // 场地设置新增与修改绑定的数据
      siteSetData: {
        classroom: "",
        yxName: "",
      },
      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },

      // 控制时间设置 新增与修改对话框的显示与隐藏
      showTimeSetModal: false,
      // 控制场地设置 新增与修改对话框的显示与隐藏
      showSiteSetModal: false,

      title: "",

      // 虚假数据
      timeSetData2: [
        {
          id: 1,
          applicationAange: "院系",
          yxName: "计算机系",
          remark: "升国旗",
          timeType: 0,
          time: ["星期一","星期二"],
          section: ["第一节","第二节","第三节"],
          isValid: "是",
        },
        {
          id: 3,
          applicationAange: "全校",
          yxName: "",
          remark: "公假",
          timeType: 1,
          time: ["2021-05-01","2021-05-05"],
          section: ["第一节","第三节"],
          isValid: "否",
        },
        {
          id: 4,
          applicationAange: "院系",
          yxName: "计算机系",
          remark: "升国旗",
          timeType: 0,
          time: "星期一",
          section: "第一节",
          isValid: "是",
        },
        {
          id: 5,
          applicationAange: "全校",
          yxName: "",
          remark: "公假",
          timeType: 1,
          time: "2021-05-01至2021-05-05",
          section: "全天",
          isValid: "是",
        },
        {
          id: 6,
          applicationAange: "院系",
          yxName: "计算机系",
          remark: "升国旗",
          time: "星期一",
          section: "第一节",
          isValid: "是",
        },
        {
          id: 7,
          applicationAange: "全校",
          yxName: "",
          remark: "公假",
          time: "2021-05-01至2021-05-05",
          section: "全天",
          isValid: "是",
        },
      ],
      siteSetTable2: [
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
        {
          id: 1,
          classroom: "信息楼201",
          faculty: "计算机系",
          isValid: "是",
        },
      ],
    };
  },
  methods: {
    // 改变页码
    changePage(i) {
      console.log(i);
    },
    // 获取时间设置的数据
    getTimeSetData() {
      this.timeSetTable = this.timeSetData2;

      let data = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
      };
      // 后端
      // that.axios.post(that.interfaceUrl + '/courseSet/selectAllByPage', that.qs(data)).then(function(res) {
      // 		if (res.data.state) {
      // 			that.page.totalNum = res.data.count
      // 			that.timeSetTable = res.data.arrCourseSet;
      // 		} else {
      // 			that.messageError(res.data.msg);
      // 		}
      // 	}).catch(function() {
      // 	that.messageError('服务器错误');
      // });
    },
    // 时间设置 打开新增或修改的对话框
    showTimeSet(row) {
      console.log(row)
      if (row) {
        this.title = "修改排课时间设置";
        if(row.timeType == 0){
          this.timeSetData.timeType = "星期"
          this.timeSetData.timeRange = row.time
          console.log(this.timeSetData)
        }else{
          this.timeSetData.timeType = "日期"
          this.timeSetData.timeDateRange = row.time
        }
        this.timeSetData.section = row.section
        this.timeSetData.isValid = row.isValid
        this.timeSetData.remark = row.remark
        this.timeSetData.applicationAange = row.yxName?row.yxName:"全校"
      // timeSetData: {
      //   applicationAange: "",
      //   remark: "",
      //   timeType: "星期",
      //   timeRange: [],
      //   section: [],
      // },
      } else {
        this.title = "新增排课时间设置";
        this.timeSetData.applicationAange="全校"
        this.timeSetData.section = []
        this.timeSetData.isValid = ''
        this.timeSetData.remark = ''
        this.timeSetData.timeRange = ''
        this.timeSetData.timeDateRange = ''
      }
      this.showTimeSetModal = true;
    },
    // 时间设置 关闭新增或修改对话框
    timeSetModalClose() {
      this.showTimeSetModal = false;
    },
    // 移除时间设置操作
    removeTimeSet(row) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除吗？",
        onOk: () => {
          // let index = this.courseInfo.findIndex((item) => item.id == row.id);
          // this.courseInfo.splice(index, 1);
        },
      });
    },

    // 获取场地设置的数据
    getSiteSetData() {
      this.siteSetTable = this.siteSetTable2;

      let data = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
      };
      // 后端
      // that.axios.post(that.interfaceUrl + '/courseSet/selectAllByPage', that.qs(data)).then(function(res) {
      // 		if (res.data.state) {
      // 			that.page.totalNum = res.data.count
      // 			that.timeSetTable = res.data.arrCourseSet;
      // 		} else {
      // 			that.messageError(res.data.msg);
      // 		}
      // 	}).catch(function() {
      // 	that.messageError('服务器错误');
      // });
    },

    // 场地设置 打开新增或修改的对话框
    showSiteSet(row) {
      if (row) {
        this.title = "修改场地设置";
      } else {
        this.title = "新增场地设置";
      }
      this.showSiteSetModal = true;
    },
    // 场地设置 关闭新增或修改对话框
    siteSetModalClose() {
      this.showSiteSetModal = false;
    },
    // 移除场地设置操作
    removeSiteSet() {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定删除吗？",
        onOk: () => {
          // let index = this.courseInfo.findIndex((item) => item.id == row.id);
          // this.courseInfo.splice(index, 1);
        },
      });
    },
  },
  mounted() {
    this.getTimeSetData();
    this.getSiteSetData();
  },
};
</script>

<style>
.courseArrangement {
  width: 100%;
  padding: 20px;
  height: 100%;
  background-color: #f3f8ff;
}
.courseArrangement .content .head-btn {
  display: flex;
  justify-content: flex-end;
}

.courseArrangement .content .ivu-btn {
  margin: 10px;
}

.courseArrangement .content .page {
  text-align: center;
  margin-top: 39px;
}

.active {
  background-color: #1b81ff;
}
</style>