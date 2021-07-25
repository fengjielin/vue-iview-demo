<template>
  <div class="classScheduleOverview">
    <ButtonGroup
      style="margin-bottom: 24px; display: flex; justify-content: center"
    >
      <Button
        v-for="(item, index) in btn"
        :key="index"
        :type="activeIndex == index ? 'primary' : 'default'"
        @click="changeBtn(index)"
        >{{ item }}
      </Button>
    </ButtonGroup>

    <!-- 教室课表 -->
    <div class="content" v-if="activeIndex == 0" style="overflow-y: auto">
      <div
        class="searchZone"
        style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        "
      >
        <div>
          <span class="curTime">当前时间：{{ getCurTime }}</span>
          <Select
            v-model="search.classroomWeekly"
            style="width: 88px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.weekNum"
              v-for="(item, index) in weeklys"
              :key="index"
              >{{ item.weekName }}
            </Option>
          </Select>
          <CheckboxGroup
            style="display: inline-block"
            v-model="search.classroomWeek"
            @on-change="setWeekClassroomSchedule"
          >
            <Checkbox
              :label="item.code"
              v-for="(item, index) in weeks"
              :key="index"
              :disabled="search.classroomWeek[0] == item.code"
              >{{ item.str }}</Checkbox
            >
          </CheckboxGroup>
        </div>
        <div>
          <Select
            style="width: 200px; margin-right: 10px"
            placeholder="请选择楼栋"
            v-model="search.buildingId"
            @on-change="searchClassSchedule"
          >
            <Option
              :value="item.id"
              v-for="(item, index) in buildings"
              :key="index"
              >{{ item.buildingName }}
            </Option>
          </Select>
          <Button type="primary" @click="exportData">
            <Icon type="ios-download-outline"></Icon>导出教室总表
          </Button>
        </div>
      </div>

      <div id="table_box">
        <Table
          ref="table"
          :disabled-hover="true"
          :columns="classroomScheduleColumns"
          :data="classroomScheduleData"
          border
          height="636"
          class="classroomTable"
          :span-method="handleSpan"
        >
        </Table>
      </div>
      <!-- 添加上课信息 -->
      <Modal
        v-model="classroomModal"
        :title="title"
        @on-ok="ok"
        @on-cancel="cancel"
      >
        <Form :model="classroomModelData" :label-width="88">
          <FormItem label="班级名称:">
            <Select
              size="small"
              v-model="classroomModelData.className"
              style="width: 160px"
            >
              <Option
                :value="item.teachingClassName"
                v-for="(item, index) in classNames"
                :key="index"
              >
                {{ item.teachingClassName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="节次:">
            <div>
              <CheckboxGroup v-model="classroomModelData.section">
                <Checkbox
                  :label="item.code"
                  v-for="(item, index) in allSection"
                  :key="index"
                >
                  {{ item.name }}
                </Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
          <FormItem label="适用周次:">
            <div>
              <CheckboxGroup v-model="classroomModelData.weekly">
                <Checkbox
                  :label="item.weekNum"
                  v-for="(item, index) in weeklys"
                  :key="index"
                >
                  {{ item.weekName }}
                </Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
        </Form>
      </Modal>
    </div>

    <!-- 教师课表 -->
    <div v-if="activeIndex == 1" class="teacherScheduleBox">
      <div class="content">
        <div class="searchZone">
          <span class="curTime">当前时间：{{ getCurTime }}</span>
          <Select
            @on-change="searchClassSchedule"
            v-model="search.teacherWeekly"
            style="width: 160px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.weekNum"
              v-for="(item, index) in weeklys"
              :key="index"
              >{{ item.weekName }}
            </Option>
          </Select>
          <Select
            @on-change="searchClassSchedule"
            v-model="search.teacherId"
            style="width: 160px; margin-left: 10px; margin-right: 10px"
          >
            <Option
              :value="item.id"
              v-for="(item, index) in teacherList"
              :key="index"
              >{{ item.xm }}</Option
            >
          </Select>
        </div>
        <Table
          :disabled-hover="true"
          border
          :loading="loading"
          :columns="teacherScheduleColumns"
          :data="teacherScheduleData"
          :span-method="handleSpan"
          style="margin: 32px 24px 24px"
        ></Table>
      </div>
      <div class="adjustCourse">
        <div class="title">调课操作信息</div>

        <div class="adjustToInfo" v-if="adjustTo">
          <div>
            <p class="littleTitle">调课对象：</p>
            <div class="info">
              {{
                formatAdjustCourseInfoData(adjustCourseInfoData.adjustCourseObj)
              }}
            </div>
          </div>
          <div>
            <p class="littleTitle">调至：</p>
            <div class="info">
              {{
                formatAdjustCourseInfoData(
                  adjustCourseInfoData.adjustCourseToObj
                )
              }}
            </div>
          </div>
          <div>
            <p class="littleTitle">冲突提示：</p>
            <div class="info" v-if="conflict">
              {{
                formatAdjustCourseInfoData(
                  adjustCourseInfoData.adjustCourseToObj
                )
              }}
            </div>
            <div class="info" v-else>无冲突信息</div>
          </div>

          <div class="footer" v-if="adjustCourseInfoData.adjustCourseObj">
            <Checkbox v-model="isSync">是否同步更新后续周次课表</Checkbox><br />
            <Button
              size="small"
              style="margin-right: 20px; background-color: #ff763f; color: #fff"
              v-text="conflict ? '强制调课' : '确定调课'"
              @click="sendAdjustCourseInfo"
              :disabled="btnDisabled"
            ></Button>
            <Button
              size="small"
              style="color: #ff763f; border: 1px solid #ff4900"
              @click="removeAdjustCourseTo"
              >取消</Button
            >
          </div>
        </div>

        <div class="adjustToForm" v-else>
          <Form :model="adjustCourseData" :label-width="55">
            <FormItem label="课程:">
              <Select
                size="small"
                v-model="adjustCourseData.courseId"
                style="width: 160px"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in courseList"
                  :key="index"
                >
                  {{ item.courseName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="班级:">
              <Select
                size="small"
                v-model="adjustCourseData.classNameId"
                style="width: 160px"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in classNames"
                  :key="index"
                >
                  {{ item.teachingClassName }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="教室:">
              <Select
                size="small"
                v-model="search.buildingId"
                style="width: 160px"
                placeholder="请选择楼栋"
                @on-change="getClassroom"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in buildings"
                  :key="index"
                >
                  {{ item.buildingName }}
                </Option>
              </Select>
              <Select
                size="small"
                v-model="adjustCourseData.classroomId"
                style="width: 160px"
                placeholder="请选择教室"
              >
                <Option
                  :value="item.id"
                  v-for="(item, index) in classroomList"
                  :key="index"
                >
                  {{ item.className }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="星期:">
              {{ adjustCourseData.week | weekStrToCode }}
            </FormItem>
            <FormItem label="节次:">
              <div style="height: 100px; overflow-y: auto">
                <CheckboxGroup v-model="adjustCourseData.section">
                  <Checkbox
                    :label="item.code"
                    v-for="(item, index) in allSection"
                    :key="index"
                  >
                    {{ item.name }}
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
            <FormItem label="周次:">
              <div style="height: 100px; overflow-y: auto">
                <CheckboxGroup v-model="adjustCourseData.weekly">
                  <Checkbox
                    :label="item.weekNum"
                    v-for="(item, index) in weeklys"
                    :key="index"
                  >
                    {{ item.weekName }}
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
          </Form>
          <div class="footer">
            <Button
              size="small"
              style="margin-right: 20px; background-color: #ff763f; color: #fff"
              @click="sendAdjustToForm"
              >确定添加</Button
            >
            <Button
              size="small"
              style="color: #ff763f; border: 1px solid #ff4900"
              @click="adjustTo = true"
              >取消</Button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 班级周课表 -->
    <div class="content" v-if="activeIndex == 2">
      <!-- 表格上方功能区 -->
      <div
        class="searchZone"
        style="display: flex; justify-content: flex-end; margin-bottom: 10px"
      >
        <span class="curTime">当前时间：{{ getCurTime }}</span>
        <Select
          @on-change="searchClassSchedule"
          v-model="search.weekly"
          style="width: 160px; margin-left: 10px; margin-right: 10px"
        >
          <Option
            :value="item.weekNum"
            v-for="(item, index) in weeklys"
            :key="index"
            >{{ item.weekName }}
          </Option>
        </Select>
        <Select
          v-model="search.classNameId"
          @on-change="searchClassSchedule"
          style="width: 200px"
        >
          <Option
            :value="item.id"
            v-for="(item, index) in classNames"
            :key="index"
          >
            {{ item.teachingClassName }}
          </Option>
        </Select>
      </div>
      <!-- 表格区域 -->
      <Table
        :disabled-hover="true"
        border
        :loading="loading"
        :columns="classScheduleColumns"
        :data="classScheduleData"
        :span-method="handleSpan"
      ></Table>
    </div>
  </div>
</template>

<script>
import teacherScheduleItems1 from "../json/teacherScheduleData.json";
import teacherScheduleItems2 from "../json/teacherScheduleData1.json";
import classScheduleItems2 from "../json/classScheduleItems2.json";
import allSection2 from "../json/allSection2.json";
import buildings2 from "../json/buildings.json";
import classroomList2 from "../json/classroomList.json";

import FileSaver from "file-saver";
import XLSX from "xlsx";

export default {
  data() {
    return {
      // 按钮组
      btn: ["教室课表", "教师课表", "班级周课表"],
      // 用于控制选择了那个按钮
      activeIndex: 0,
      // 控制调课操作信息的切换
      adjustTo: true,
      conflict: false,

      // 教室课程中 控制添加上课信息的对话框
      classroomModal: false,

      title: "",

      // 是否同步更新后续周次课表
      isSync: false,

      loading: false,

      // 当前的时间
      curTime: "",
      // 表格上方的搜索
      search: {
        classroomWeekly: "",
        classroomWeek: [],
        buildingId: 0,

        weekly: "",
        classNameId: "",

        teacherWeekly: "",
        teacherId: "",
      },

      // 教室课表
      classroomScheduleColumns: [],

      classroomScheduleData: [],

      // 教师课表
      teacherScheduleColumns: [
        {
          title: "节次",
          key: "name",
          align: "center",
          width: 85,
          className: "codeStyle",
        },
        {
          title: "星期一",
          key: "week1",
          align: "center",
          width: 182,
          render: (h, params) => {
            return this.getColumns(h, params, "1", params.row.week1);
          },
        },
        {
          title: "星期二",
          key: "week2",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "2", params.row.week2);
          },
        },
        {
          title: "星期三",
          key: "week3",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "3", params.row.week3);
          },
        },
        {
          title: "星期四",
          key: "week4",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "4", params.row.week4);
          },
        },
        {
          title: "星期五",
          key: "week5",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "5", params.row.week5);
          },
        },
        {
          title: "星期六",
          key: "week6",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "6", params.row.week6);
          },
        },
        {
          title: "星期日",
          key: "week7",
          width: 182,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "7", params.row.week7);
          },
        },
      ],
      teacherScheduleData: [],

      // 班级周课表
      classScheduleColumns: [
        {
          title: "节次",
          key: "name",
          align: "center",
          minWidth: 220,
          className: "codeStyle",
        },
        {
          title: "星期一",
          key: "week1",
          align: "center",
          minWidth: 210,
          render: (h, params) => {
            return this.getColumns(h, params, "1", params.row.week1);
          },
        },
        {
          title: "星期二",
          key: "week2",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "2", params.row.week2);
          },
        },
        {
          title: "星期三",
          key: "week3",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "3", params.row.week3);
          },
        },
        {
          title: "星期四",
          key: "week4",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "4", params.row.week4);
          },
        },
        {
          title: "星期五",
          key: "week5",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "5", params.row.week5);
          },
        },
        {
          title: "星期六",
          key: "week6",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "6", params.row.week6);
          },
        },
        {
          title: "星期日",
          key: "week7",
          minWidth: 210,
          align: "center",
          render: (h, params) => {
            return this.getColumns(h, params, "7", params.row.week7);
          },
        },
      ],
      classScheduleData: [],

      // 调课操作信息中的绑定数据
      adjustCourseData: {
        courseId: "",
        classNameId: "",
        classroomId: "",
        week: "",
        section: [],
        weekly: [],
      },
      adjustCourseInfoData: {
        adjustCourseObj: "",
        adjustCourseToObj: "",
      },

      // 教室课表 添加上课信息弹窗中的绑定数据
      classroomModelData: {
        className: "1",
        section: [],
        weekly: [],
      },

      // 单元格是否进行了已经点击操作，false为已经点击
      again: true,
      // 控制调课操作信息的确认按钮的可用状态
      btnDisabled: true,

      // 一个中转，用于接收后端数据，后再封装到Data中
      allSection: [],
      classScheduleItems: [],
      teacherScheduleItems: [],
      classroomScheduleItems: [],

      // 当前学期
      curTerm: {},

      // 教师列表
      teacherList: [],

      // 星期
      weeks: [
        { code: 0, str: "星期日" },
        { code: 1, str: "星期一" },
        { code: 2, str: "星期二" },
        { code: 3, str: "星期三" },
        { code: 4, str: "星期四" },
        { code: 5, str: "星期五" },
        { code: 6, str: "星期六" },
      ],
      // 周次
      weeklys: [
        {
          weekName: "第1周",
          beginDate: "2021-06-27",
          endDate: "2021-07-03",
          weekNum: 0,
        },
        {
          weekName: "第2周",
          beginDate: "2021-07-03",
          endDate: "2021-07-10",
          weekNum: 1,
        },
        {
          weekName: "第3周",
          beginDate: "2021-07-10",
          endDate: "2021-07-17",
          weekNum: 2,
        },
        {
          weekName: "第4周",
          beginDate: "2021-07-17",
          endDate: "2021-07-24",
          weekNum: 3,
        },
        {
          weekName: "第5周",
          beginDate: "2021-07-24",
          endDate: "2021-07-31",
          weekNum: 4,
        },
      ],

      // 楼栋信息
      buildings: [],

      // 教室信息
      classroomList: [],

      // 课程信息
      courseList: [
        {
          id: 1,
          courseName: "综合英语II",
        },
        {
          id: 2,
          courseName: "综合英语III",
        },
        {
          id: 3,
          courseName: "JavaScript",
        },
      ],

      // 班级信息
      classNames: [
        {
          id: 1,
          teachingClassName: "20届商务英语A班",
        },
        {
          id: 2,
          teachingClassName: "20届商务英语B班",
        },
        {
          id: 3,
          teachingClassName: "20届商务英语C班",
        },
      ],
    };
  },
  methods: {
    exportData() {
      let et = XLSX.utils.table_to_book(document.getElementById("table_box"));
      let etout = XLSX.write(et, {
        bookType: "xlsx",
        bookSST: true,
        type: "array",
      });
      try {
        FileSaver.saveAs(
          new Blob([etout], {
            type: "application/octet-stream",
          }),
          "trade-publish.xlsx"
        ); //trade-publish.xlsx 为导出的文件名
      } catch (e) {
        console.log(e, etout);
      }
      return etout;
    },
    // 教室课表的多选框 与 课表的对应
    setWeekClassroomSchedule() {
      console.log(this.search.classroomWeek);
      let classroomWeek = this.deepClone(this.search.classroomWeek);
      classroomWeek.sort((a, b) => a - b);
      let week = null;
      this.classroomScheduleColumns = [];
      classroomWeek.forEach((item, i) => {
        switch (item) {
          case 1:
            week = "week1";
            this.setCourse(item, i, week, item, "星期一");
            break;
          case 2:
            week = "week2";
            this.setCourse(item, i, week, item, "星期二");
            break;
          case 3:
            week = "week3";
            this.setCourse(item, i, week, item, "星期三");
            break;
          case 4:
            week = "week4";
            this.setCourse(item, i, week, item, "星期四");
            break;
          case 5:
            week = "week5";
            this.setCourse(item, i, week, item, "星期五");
            break;
          case 6:
            week = "week6";
            this.setCourse(item, i, week, item, "星期六");
            break;
          case 0:
            week = "week0";
            this.setCourse(item, i, week, item, "星期日");
            break;
        }
      });

      this.getSchedule();
    },

    // 不同的星期应该生成不同的课程，不应该放在一起，会出现点击多个星期出现同样的课程安排
    setCourse(item, i, week, weekStr, str) {
      if (i == 0) {
        let weekClassroomSchedule = {
          title: str,
          align: "center",
          children: [
            {
              title: "",
              key: "className",
              align: "center",
              width: 120,
              renderHeader: (h, params) => {
                return h(
                  "div",
                  {
                    style: {
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      "flex-direction": "column",
                    },
                  },
                  [
                    h(
                      "strong",
                      {
                        style: {
                          "margin-left": "40px",
                        },
                      },
                      "节次"
                    ),

                    h(
                      "strong",
                      {
                        style: {
                          "margin-right": "40px",
                        },
                      },
                      "地点"
                    ),
                    h(
                      "strong",
                      {
                        style: {
                          position: "absolute",
                          transform:
                            "rotate(30deg) translateY(-20px) translateX(-6px)",
                          color: "#e8eaec",
                          left: "0px",
                          top: "38px",
                        },
                      },
                      "_________________"
                    ),
                  ]
                );
              },
            },
          ],
        };
        this.allSection.forEach((e) => {
          let code = {
            title: e.code,
            key: "",
            align: "center",
            minWidth: 90,
            render: (h, params) => {
              return this.getClassroomColumns(
                h,
                params,
                week,
                e.code,
                params.row,
                weekStr
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      } else {
        let weekClassroomSchedule = {
          title: str,
          align: "center",
          children: [],
        };
        this.allSection.forEach((e) => {
          let code = {
            title: e.code,
            key: "",
            align: "center",
            minWidth: 90,
            render: (h, params) => {
              return this.getClassroomColumns(
                h,
                params,
                week,
                e.code,
                params.row,
                weekStr
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      }
    },

    // 教室课表，往单元格中渲染固定格式的信息
    getClassroomColumns(h, params, week, section, row, weekStr) {
      // 根据先前封装的数据中不同的情况渲染不一样的东西
      let curWeek = row[week] ? row[week][section] : "";
      let temp = null;
      temp = h("div", [
        curWeek.id
          ? h("div", [
              h("div", curWeek.className),
              h(
                "div",
                `${curWeek.course}(${this.formatWeekly(curWeek.weekly)})`
              ),
              h("div", curWeek.teachName),
            ])
          : h(
              "div",
              {
                attrs: {
                  class: "blankBox",
                },
                style: {
                  cursor: "pointer",
                  height: "60px",
                },
                on: {
                  click: () => {
                    this.showClassroomModel(params, weekStr);
                  },
                },
              },
              [
                h("Icon", {
                  props: {
                    type: "md-add",
                  },
                }),
              ]
            ),
      ]);
      return temp;
    },

    // 显示教室课表的添加上课信息的弹窗
    showClassroomModel(row, weekStr) {
      let toWeekly = this.weeklys.find(
        (item) => item.weekNum == this.search.teacherWeekly
      );
      this.title = `添加上课信息 ( ${row.row.className} ${toWeekly.weekName} ${weekStr} 第${row.column.title}节)`;

      this.classroomModelData.className = "";
      this.classroomModelData.section = [row.column.title];
      this.classroomModelData.weekly = [this.search.classroomWeekly];
      this.classroomModal = true;
    },
    // 教室课表的对话框的确定跟取消
    ok() {
      this.$Message.info("Clicked ok");

      // 后端
      // let data = {
      //   className: this.classroomModelData.className,
      //   section: this.classroomModelData.section,
      //   weekly: this.classroomModelData.weekly,
      // };

      let data = {
        scheduleId: "", //课表Id 新增则无，调课有
        to_weekly: "", //调至周次 1,2,3
        to_week: "", //调至星期
        to_section: "", //调至节次 5,6
        to_classroom_id: "", //调至教室
        teaching_class: "", //教学班
        teaching_class_id: "", //教学班
        to_teaching_teacher: "", //调至教师ID
        course_name: "", //课程
        course_id: "", //课程ID
        term_id: "", //学期
        tkType: "", //临时调课T01 新增T02  影响后续的永久调课T03
      };

      console.log(data);
      this.classroomScheduleItems.push(a);
      this.getSchedule();
    },

    cancel() {
      this.$Message.info("Clicked cancel");
      this.classroomModelData.className = "";
      this.classroomModelData.section = [];
      this.classroomModelData.weekly = [];
    },

    // 教师课表和班级课表 往单元格中渲染固定格式的信息
    getColumns(h, params, num, curWeek) {
      let temp = null;
      if (this.activeIndex == 1) {
        temp = h("div", [
          curWeek // 判断单元格内是否值
            ? h(
                "Dropdown",
                {
                  props: {
                    transfer: true,
                    trigger: "click",
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        cursor: "pointer",
                        margin: "8px 0",
                      },
                    },
                    [
                      h(
                        "div",
                        curWeek.course +
                          "," +
                          this.formatWeekly(curWeek.weekly) +
                          "," +
                          curWeek.teachName
                      ),
                      h("div", curWeek.classroom),
                      h("div", curWeek.className),
                    ]
                  ),
                  this.again // 判断当前点击的单元格是第一次点击还是第二次点击
                    ? h(
                        "DropdownMenu",
                        {
                          slot: "list",
                        },
                        [
                          h(
                            "DropdownItem",
                            {
                              nativeOn: {
                                click: () => {
                                  this.adjustTo = true;
                                  this.adjustCourseInfoData.adjustCourseObj =
                                    params.row[params.column.key];

                                  this.adjustCourseInfoData.adjustCourseObj[
                                    `weekStr${params.column._index}`
                                  ] =
                                    params.row[
                                      `weekStr${params.column._index}`
                                    ];
                                  this.adjustCourseInfoData.adjustCourseObj.sectionID =
                                    this.isMerge(params);
                                  this.again = false;
                                },
                              },
                            },
                            "调至"
                          ),
                          h(
                            "DropdownItem",
                            {
                              nativeOn: {
                                click: () => {
                                  this.removeCourse(
                                    params.row[params.column.key]
                                  );
                                },
                              },
                            },
                            "移除"
                          ),
                        ]
                      )
                    : h(
                        "div",
                        {
                          style: {
                            cursor: "pointer",
                            position: "absolute",
                            top: "0",
                            width: "100%",
                            height: "80px",
                          },
                          on: {
                            click: (e) => {
                              e.stopPropagation(); // 阻止事件冒泡
                              this.adjustCourseInfoData.adjustCourseToObj = {
                                msg: "当前所选时间，您已有其它课程，请选择其它时间",
                              };
                              this.btnDisabled = false;
                              this.conflict = true;
                            },
                          },
                        },
                        ""
                      ),
                ]
              )
            : h(
                "Dropdown",
                {
                  props: {
                    transfer: true,
                    trigger: "click",
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        cursor: "pointer",
                        margin: "8px 0",
                        width: "160px",
                        height: "60px",
                        color: "#fff",
                      },
                    },
                    ""
                  ),
                  this.again
                    ? h(
                        "DropdownMenu",
                        {
                          slot: "list",
                        },
                        [
                          h(
                            "DropdownItem",
                            {
                              nativeOn: {
                                click: () => {
                                  this.adjustTo = false;
                                  this.adjustCourseData.week =
                                    params.column._index;

                                  this.adjustCourseData.section = [];
                                  this.adjustCourseData.section.push(
                                    params.row.code
                                  );
                                  this.adjustCourseData.weekly = [
                                    this.search.teacherWeekly,
                                  ];
                                },
                              },
                            },
                            "添加"
                          ),
                        ]
                      )
                    : h(
                        "div",
                        {
                          style: {
                            cursor: "pointer",
                            position: "absolute",
                            top: "0",
                            width: "100%",
                            height: "80px",
                          },
                          on: {
                            click: (e) => {
                              e.stopPropagation(); // 阻止事件冒泡
                              this.btnDisabled = false;
                              // 当点击第二下的时候，应该是去请求后端，进行判断，第二下点击的位置（周几，第几节，那个教室）是否有课
                              // 有占用，就返回占用的课程信息，没有占用就返回true
                              this.isConflict(params);
                            },
                          },
                        },
                        ""
                      ),
                ]
              ),
        ]);
      } else if (this.activeIndex == 2) {
        temp = h("div", [
          curWeek
            ? h(
                "div",
                {
                  style: {
                    margin: "8px 0",
                  },
                },
                [
                  h(
                    "div",
                    curWeek.course +
                      "," +
                      this.formatWeekly(curWeek.weekly) +
                      "," +
                      curWeek.teachName
                  ),
                  h("div", curWeek.classroom),
                  h("div", curWeek.className),
                ]
              )
            : "",
        ]);
      }
      return temp;
    },

    // 判断选择调至的课程是否为合并的课程
    isMerge(course) {
      let curWeekStr =
        this.adjustCourseInfoData.adjustCourseObj[
          `weekStr${course.column._index}`
        ];
      let weekStr = `weekStr${course.column._index}`;

      let sectionID = [];
      this.teacherScheduleData.forEach((item) => {
        if (item[course.column.key] && item[weekStr] == curWeekStr) {
          sectionID.push(item.code);
        }
      });
      return sectionID;
    },

    // 调课操作是否发生冲突
    isConflict(params) {
      let adjustCourseToObj = null;
      let assemble = teacherScheduleItems1.concat(teacherScheduleItems2);
      assemble.forEach((e) => {
        // params.column.title 当前星期
        // params.row.name 当前节次
        // params.row.code 当前节次
        if (
          e.teachName != this.search.teacher &&
          params.column.title == e.week &&
          params.row.name == e.section &&
          this.adjustCourseInfoData.adjustCourseObj.classroom == e.classroom
        ) {
          // 找到不是当前老师的，在这一天，这一节，这间教室的课程安排
          // 存在冲突
          this.conflict = true;
          adjustCourseToObj = e;
        } else if (!adjustCourseToObj) {
          this.conflict = false;
          // 无冲突
          adjustCourseToObj = this.deepClone(
            this.adjustCourseInfoData.adjustCourseObj,
            {}
          );
          let toWeekly = this.weeklys.find(
            (item) => item.weekNum == this.search.teacherWeekly
          );
          adjustCourseToObj.weekName = toWeekly.weekName;
          adjustCourseToObj.weekNum = toWeekly.weekNum;
          adjustCourseToObj.week = params.column.title;
          adjustCourseToObj.section = params.row.name;

          //
          let sectionArr = this.adjustCourseInfoData.adjustCourseObj.sectionID;
          let differenceValue =
            this.adjustCourseInfoData.adjustCourseObj.sectionID[0] -
            params.row.code;
          if (differenceValue > 0) {
            adjustCourseToObj.sectionID = sectionArr.map(
              (section) => section * 1 - differenceValue
            );
          } else if (differenceValue < 0) {
            adjustCourseToObj.sectionID = sectionArr.map(
              (section) => section * 1 - differenceValue
            );
          }
        }
      });

      if (
        adjustCourseToObj.sectionID[adjustCourseToObj.sectionID.length - 1] >
        this.allSection.length
      ) {
        this.adjustCourseInfoData.adjustCourseToObj = {
          msg: "节次已超过所设定的最大节次数",
        };
        this.btnDisabled = true;
        this.conflict = true;
      } else {
        this.adjustCourseInfoData.adjustCourseToObj = adjustCourseToObj;
      }
    },

    // 移除按钮的事件
    removeCourse(obj) {
      this.$Modal.confirm({
        closable: true,
        title: "提示",
        content: "确定移除该课程安排吗？",
        onOk: () => {
          let index = this.teacherScheduleItems.findIndex(
            (item) => item.id == obj.id
          );
          this.teacherScheduleItems.splice(index, 1);
          this.getSchedule();
        },
      });
    },
    // 调课操作信息中的取消事件
    removeAdjustCourseTo() {
      this.again = true;
      this.adjustCourseInfoData.adjustCourseObj = "";
      this.adjustCourseInfoData.adjustCourseToObj = "";
      this.getSchedule();
    },

    // 调课操作信息中的确认事件
    sendAdjustCourseInfo() {
      this.again = true;
      this.btnDisabled = true;

      // 后端
      let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj;
      let adjustCourseToObj = this.adjustCourseInfoData.adjustCourseToObj;

      let data = {
        scheduleId: adjustCourseObj.id, //课表Id 新增则无，调课有
        term_id: this.curTerm.id,
        course_id: adjustCourseObj.courseID,
        course_name: adjustCourseObj.course, //课程
        teaching_teacher_id: adjustCourseObj.teacherId,
        teaching_teacher_name: adjustCourseObj.teachName,
        teaching_class_id: adjustCourseObj.classNameID,
        to_classroom_id: adjustCourseObj.classroomID,
        to_weekly: adjustCourseToObj.weekly.toString(),
        to_section: adjustCourseToObj.sectionID,
        to_week: adjustCourseToObj.weekNum,
        tkType: this.isSync ? "T03" : "T01", //临时调课T01 新增T02  影响后续的永久调课T03
      };
      this.selectScheduleOverviewClassRoom(data);
      this.$Message.success("操作成功");
      this.adjustCourseInfoData.adjustCourseObj = "";
      this.adjustCourseInfoData.adjustCourseToObj = "";
      this.getSchedule();
    },

    // 调课操作信息中的表单确认事件
    sendAdjustToForm() {
      this.adjustTo = true;
      this.adjustCourseData.teachName = this.search.teacher;

      let course_name = this.classNames.find(
        (item) => item.id == this.adjustCourseData.classNameId
      ).teachingClassName;
      let teaching_teacher_name = this.teacherList.find(
        (item) => item.id == this.search.teacherId
      ).xm;

      let data = {
        scheduleId: "", //课表Id 新增则无，调课有
        term_id: this.curTerm.id,
        course_id: this.adjustCourseData.courseId,
        course_name: course_name, //课程
        teaching_teacher_id: this.search.teacherId,
        teaching_teacher_name: teaching_teacher_name,
        teaching_class_id: this.adjustCourseData.classNameId,
        to_classroom_id: this.adjustCourseData.classroomId,
        to_weekly: this.adjustCourseData.weekly.toString(),
        to_section: this.adjustCourseData.section.toString(),
        to_week: this.adjustCourseData.week,
        tkType: "T02", //临时调课T01 新增T02  影响后续的永久调课T03
      };
      this.selectScheduleOverviewClassRoom(data);
      this.getSchedule();
    },

    // 新增或调课
    selectScheduleOverviewClassRoom(data) {
      console.log(data);

      let that = this;
      // let data = {
      // 	scheduleId: '', //课表Id 新增则无，调课有
      // 	to_weekly: '', //调至周次 1,2,3
      // 	to_week: '', //调至星期
      // 	to_section: '', //调至节次 5,6
      // 	to_classroom_id: '', //调至教室
      // 	teaching_class: '', //教学班
      // 	teaching_class_id: '', //教学班
      // 	to_teaching_teacher: '', //调至教师ID
      // 	course_name: '', //课程
      // 	course_id: '', //课程ID
      // 	term_id: '', //学期
      // 	tkType: '', //临时调课T01 新增T02  影响后续的永久调课T03
      // }
      // that.axios.post(that.interfaceUrl + 'TKScheduleOverview/selectScheduleOverviewClassRoom', that.qs(data)).then(
      // 		function(res) {
      // 			console.log(res)
      // 			if (res.data.state) {

      // 			} else {
      // 				that.messageError(res.data.message);
      // 			}
      // 		})
      // 	.catch(function() {
      // 		that.messageError('服务器错误');
      // 	});
    },

    // 切换按钮
    changeBtn(index) {
      this.activeIndex = index;
      // 0：教室课表，1：教师课表；2：班级周课表
      switch (index) {
        case 0:
          console.log("教室课表");
          this.getBuilding();
          this.getSchedule();
          break;
        case 1:
          console.log("教师课表");
          this.getSchedule();
          break;
        case 2:
          console.log("班级周课表");
          this.getSchedule();
          break;
      }
    },
    // 行、列合并
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (this.activeIndex == 0) {
        if (rowIndex == row._index && columnIndex == column._index) {
          if (row.week0) {
            if (row.week0[column.title]) {
              if (Object.keys(row.week0[column.title]).length != 0) {
                let x = row.week0[column.title].mergeNum == 0 ? 0 : 1;
                let y =
                  row.week0[column.title].mergeNum == 0
                    ? 0
                    : row.week0[column.title].mergeNum;
                return {
                  rowspan: x,
                  colspan: y,
                };
              }
            }
          } else {
            return {
              rowspan: 1,
              colspan: 1,
            };
          }
        }
      } else {
        if (columnIndex == 1) {
          //计算合并的行数列数
          let x = row.week1MergeCol == 0 ? 0 : row.week1MergeCol;
          let y = row.week1MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 2) {
          //计算合并的行数列数
          let x = row.week2MergeCol == 0 ? 0 : row.week2MergeCol;
          let y = row.week2MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 3) {
          //计算合并的行数列数
          let x = row.week3MergeCol == 0 ? 0 : row.week3MergeCol;
          let y = row.week3MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 4) {
          //计算合并的行数列数
          let x = row.week4MergeCol == 0 ? 0 : row.week4MergeCol;
          let y = row.week4MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 5) {
          //计算合并的行数列数
          let x = row.week5MergeCol == 0 ? 0 : row.week5MergeCol;
          let y = row.week5MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 6) {
          //计算合并的行数列数
          let x = row.week6MergeCol == 0 ? 0 : row.week6MergeCol;
          let y = row.week6MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
        if (columnIndex == 7) {
          //计算合并的行数列数
          let x = row.week7MergeCol == 0 ? 0 : row.week7MergeCol;
          let y = row.week7MergeCol == 0 ? 0 : 1;
          return [x, y];
        }
      }
    },

    // 用于计算合并的规则
    assembleData(data) {
      if (this.activeIndex === 0) {
        data.forEach((classroom, i) => {
          console.log({ classroom, i });
          classroom.mergeObj = {}
          this.search.classroomWeek.forEach((weekNum) => {
            classroom.mergeObj[`week${weekNum}Merge`] = 1
            let cWeek = classroom[`week${weekNum}`];
            if (cWeek) {
              let cWeekArr = Object.keys(cWeek);
              
              console.log(cWeekArr);
              // cWeekArr.forEach((section,i) => {
              //   if(cWeek[section].id && cWeek[section].already != 1){
              //     if(cWeekArr[i+1] && cWeek[cWeekArr[i+1]]){
              //       cWeek[section].mergeNum = 1;
              //       for (let a = i + 1; a < cWeekArr.length; a++) {
              //         console.log(a)
              //         if(cWeek[section].sectionStr == cWeek[cWeekArr[a]].sectionStr){
              //           cWeek[section].mergeNum ++
              //           cWeek[cWeekArr[a]].already = 1;
              //           console.log(cWeek[section].sectionStr)
              //           console.log(cWeek[cWeekArr[a]].sectionStr)
              //         }else{
              //           break
              //         }

              //       }
              //     }
              //   }
              // });

              for (let section in cWeek) {
                if (cWeek[section].id && cWeek[section].already != 1) {
                  if (cWeek[section * 1 + 1]) {
                    cWeek[section].mergeNum = 1;
                    if (
                      cWeek[section].sectionStr ==
                        cWeek[section * 1 + 1].sectionStr
                    ) {
                      cWeek[section].mergeNum++;
                      cWeek[section * 1 + 1].mergeNum = 0;
                      cWeek[section * 1 + 1].already = 1;
                    }
                  }
                }
              }
            }
          });
        });
        return data;
      } else {
        data.forEach((e, i) => {
          if (e.weekStr1 && e.week1.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week1MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr1 === data[a].weekStr1) {
                  e.week1MergeCol++;
                  data[a].week1MergeCol = 0;
                  data[a].week1.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr2 && e.week2.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week2MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr2 === data[a].weekStr2) {
                  e.week2MergeCol++;
                  data[a].week2MergeCol = 0;
                  data[a].week2.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr3 && e.week3.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week3MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr3 === data[a].weekStr3) {
                  e.week3MergeCol++;
                  data[a].week3MergeCol = 0;
                  data[a].week3.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr4 && e.week4.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week4MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr4 === data[a].weekStr4) {
                  e.week4MergeCol++;
                  data[a].week4MergeCol = 0;
                  data[a].week4.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr5 && e.week5.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week5MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr5 === data[a].weekStr5) {
                  e.week5MergeCol++;
                  data[a].week5MergeCol = 0;
                  data[a].week5.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr6 && e.week6.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week6MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr6 === data[a].weekStr6) {
                  e.week6MergeCol++;
                  data[a].week6MergeCol = 0;
                  data[a].week6.already = 1;
                } else {
                  break;
                }
              }
            }
          }
          if (e.weekStr7 && e.week7.already != 1) {
            // 判断当前遍历到的行是否已经合并过了 特定星期
            if (data[i + 1]) {
              // 判断当前行的下一行是否有数据
              e.week7MergeCol = 1; // 用于表示特定一列的合并数据
              for (let a = i + 1; a < data.length; a++) {
                if (e.weekStr7 === data[a].weekStr7) {
                  e.week7MergeCol++;
                  data[a].week7MergeCol = 0;
                  data[a].week7.already = 1;
                } else {
                  break;
                }
              }
            }
          }
        });
        return data;
      }
    },

    // 搜索操作
    searchClassSchedule() {
      console.log(this.search);
      // this.search.weekly
      // this.search.className

      // this.search.buildingId
      if (this.search.buildingId && this.activeIndex == 0) {
        this.getClassroom();
      }

      this.getSchedule();
    },

    // 获取节次信息
    getSection() {
      let that = this;
      this.allSection = allSection2;
      that.getSchedule();
      that.setWeekClassroomSchedule();
      // this.axios.post(that.interfaceUrl + 'classtime/getArrClassTimeByPage', that.qs({
      // 	pageNum: 1,
      // 	pageSize: 999
      // })).then(resp => {
      // 	console.log(resp)
      // 	if (resp.data.state) {
      // 		that.allSection = resp.data.arrClassTime;
      // 		that.getSchedule();
      // 		that.setWeekClassroomSchedule();
      // 	} else {
      // 		that.messageError(resp.data.msg);
      // 	}
      // })
    },

    // 获取课程安排信息
    getSchedule() {
      if (this.activeIndex == 0) {
        // 教室课表
        this.classroomScheduleData = [];

        let classroomListCopy = this.deepClone(this.classroomList);
        if (this.classroomScheduleItems.length == 0) {
          this.classroomScheduleItems = this.deepClone(classScheduleItems2);
        }

        this.formatTeacthscheduleData(
          this.classroomScheduleItems,
          classroomListCopy,
          this.allSection
        );
        this.classroomScheduleData = this.assembleData(classroomListCopy);
      } else if (this.activeIndex == 1) {
        // 教师课表
        this.teacherScheduleData = [];
        // 刷新节次信息
        let allSection = this.deepClone(this.allSection);

        // 在这里请求后端 应该是发生教师的id和当前第几周，拿到对应老师的课表
        let data = {
          teacherId: "",
          weekly: "",
        };

        // 刷新课程安排信息
        if (this.teacherScheduleItems.length == 0) {
          this.teacherScheduleItems = this.deepClone(teacherScheduleItems1);
        }

        this.formatscheduleData(this.teacherScheduleItems, allSection);
        this.teacherScheduleData = this.assembleData(allSection);
      } else if (this.activeIndex == 2) {
        this.classScheduleData = [];
        // 刷新节次信息
        let allSection = this.deepClone(this.allSection);

        // 班级周课表
        // 发给后端
        let data = {
          weekly: "", //第几周
          className: "", //哪个班级
        };

        // 刷新课程安排信息
        if (this.classScheduleItems.length == 0) {
          this.classScheduleItems = this.deepClone(classScheduleItems2);
        }

        this.formatscheduleData(this.classScheduleItems, allSection);
        this.classScheduleData = this.assembleData(allSection);
      }
      this.loading = false;
    },

    // 格式化教室课程表的数据
    formatTeacthscheduleData(
      classroomScheduleItems,
      classroomListCopy,
      allSection
    ) {
      let sectionObj = {};
      allSection.forEach((section) => {
        sectionObj[section.code] = {};
      });
      classroomScheduleItems.forEach((item) => {
        this.search.classroomWeek.forEach((w) => {
          if (item.weekNum === w) {
            let info = `${item.course},${item.teachName},${item.classroom},${item.className}`;
            classroomListCopy.forEach((e) => {
              if (item.classroomID == e.id) {
                switch (w) {
                  case 1:
                    e.week1 ? "" : (e.week1 = this.deepClone(sectionObj));
                    e.week1[item.sectionID] = item;

                    e.week1[item.sectionID]["sectionStr"] = info;
                    break;
                  case 2:
                    e.week2 ? "" : (e.week2 = this.deepClone(sectionObj));
                    e.week2[item.sectionID] = item;

                    e.week2[item.sectionID]["sectionStr"] = info;
                    break;
                  case 3:
                    e.week3 ? "" : (e.week3 = this.deepClone(sectionObj));
                    e.week3[item.sectionID] = item;

                    e.week3[item.sectionID]["sectionStr"] = info;
                    break;
                  case 4:
                    e.week4 ? "" : (e.week4 = this.deepClone(sectionObj));
                    e.week4[item.sectionID] = item;

                    e.week4[item.sectionID]["sectionStr"] = info;
                    break;
                  case 5:
                    e.week5 ? "" : (e.week5 = this.deepClone(sectionObj));
                    e.week5[item.sectionID] = item;

                    e.week5[item.sectionID]["sectionStr"] = info;
                    break;
                  case 6:
                    e.week6 ? "" : (e.week6 = this.deepClone(sectionObj));
                    e.week6[item.sectionID] = item;

                    e.week6[item.sectionID]["sectionStr"] = info;
                    break;
                  case 0:
                    e.week0 ? "" : (e.week0 = this.deepClone(sectionObj));
                    e.week0[item.sectionID] = item;

                    e.week0[item.sectionID]["sectionStr"] = info;
                    break;
                }
              }
            });
          }
        });
      });
    },

    // 格式化教室与班级周课程表的数据
    formatscheduleData(scheduleItems, allSection) {
      allSection.forEach((sectionItem) => {
        scheduleItems.forEach((scheduleItem) => {
          if (sectionItem.id == scheduleItem.sectionID) {
            // info 用于判断是否应该合并
            let info = `${scheduleItem.course},${scheduleItem.teachName},${scheduleItem.classroom},${scheduleItem.className}`;

            switch (scheduleItem.weekNum) {
              case 1:
                sectionItem.week1 = scheduleItem;
                sectionItem.weekStr1 = info;
                break;
              case 2:
                sectionItem.week2 = scheduleItem;
                sectionItem.weekStr2 = info;
                break;
              case 3:
                sectionItem.week3 = scheduleItem;
                sectionItem.weekStr3 = info;
                break;
              case 4:
                sectionItem.week4 = scheduleItem;
                sectionItem.weekStr4 = info;
                break;
              case 5:
                sectionItem.week5 = scheduleItem;
                sectionItem.weekStr5 = info;
                break;
              case 6:
                sectionItem.week6 = scheduleItem;
                sectionItem.weekStr6 = info;
                break;
              case 0:
                sectionItem.week7 = scheduleItem;
                sectionItem.weekStr7 = info;
                break;
            }
          }
        });
      });
    },

    // 获取周次
    getWeekly() {
      let that = this;
      // this.axios
      // 	.post(
      // 		that.interfaceUrl + "week/selectAllByPage",
      // 		that.qs({
      // 			pageNum: 1,
      // 			pageSize: 999,
      // 			termId: that.curTerm.id,
      // 		})
      // 	)
      // 	.then((resp) => {
      // 		console.log(resp);
      // 		if (resp.data.state) {
      // 			that.weeklys = resp.data.weekList;
      // 			that.compareDate(that.curTime, resp.data.weekList);
      // 		} else {
      // 			that.messageError(resp.data.msg);
      // 		}
      // 	});
    },

    // 获取课程
    getCourse() {
      // this.courseList =
      let that = this;
      // that.axios
      // 	.post(
      // 		that.interfaceUrl + "tkTeachingClass/findCourses",
      // 		that.qs({
      // 			pageNum: 1,
      // 			pageSize: 999,
      // 		})
      // 	)
      // 	.then(function(res) {
      // 		console.log(res.data);
      // 		if (res.data.state) {
      // 			that.courseList = res.data.AdminTeachingClassList;
      // 		} else {
      // 			that.messageError(res.data.msg);
      // 		}
      // 	});
    },

    // 获取班级
    getClassName() {
      let that = this;
      // this.classNames =
      // that.axios
      // 	.post(
      // 		that.interfaceUrl + "tkTeachingClass/selectAllByPage",
      // 		that.qs({
      // 			pageNum: 1,
      // 			pageSize: 999,
      // 		})
      // 	)
      // 	.then(function(res) {
      // 		console.log(res.data.TeachingClassList);
      // 		if (res.data.state) {
      // 			that.classNames = res.data.TeachingClassList;
      // 			that.search.classNameId = res.data.TeachingClassList[0].id
      // 		} else {
      // 			that.messageError(res.data.msg);
      // 		}
      // 	});
    },

    // 获取老师
    getTeacher() {
      let that = this;
      // this.teacherList =
      // that.axios
      // 	.post(
      // 		that.interfaceUrl + "teacher/selectAllByPage",
      // 		that.qs({
      // 			pageNum: 1,
      // 			pageSize: 999,
      // 		})
      // 	)
      // 	.then(function(res) {
      // 		console.log(res.data);
      // 		if (res.data.state) {
      // 			that.teacherList = res.data.teacherList;
      // 			that.search.teacherId = res.data.teacherList[0].id
      // 		} else {
      // 			that.messageError(res.data.msg);
      // 		}
      // 	});
    },

    // 获取楼栋信息
    getBuilding() {
      this.buildings = buildings2;
      this.search.buildingId = buildings2[0].id;
      this.getClassroom();
      let that = this;
      // that.axios.post(that.interfaceUrl + 'teachingBuilding/selectAll').then(function(res) {
      // 	console.log(res.data)
      // 	if (res.data.state) {
      // 		if (res.data.buildings) {
      // 			that.buildings = res.data.buildings
      // 			that.search.buildingId = res.data.buildings[0].id
      // 			that.getClassroom()
      // 		}
      // 	} else {
      // 		that.messageError(res.data.msg);
      // 	}
      // });
    },

    // 获取教室信息
    getClassroom() {
      this.classroomList = classroomList2;
      let that = this;
      // that.axios.post(that.interfaceUrl + '/classroom/selectAllByPage', that.qs({
      // 	pageNum: 1,
      // 	pageSize: 999,
      // 	buildingId: that.search.buildingId
      // })).then(function(res) {
      // 	console.log(res.data)
      // 	if (res.data.state) {
      // 		that.classroomList = res.data.classroomList
      // 		if (that.activeIndex == 0) {
      // 			that.setWeekClassroomSchedule()
      // 		}
      // 	} else {
      // 		that.messageError(res.data.msg);
      // 	}
      // })
    },
    // 实现深拷贝
    deepClone(origin, target) {
      let newTarget = target || [];
      // 1.遍历对象
      for (let prop in origin) {
        // 2.判断是否为引用值
        if (origin[prop] !== "null" && typeof origin[prop] == "object") {
          // 3.判断引用值是数组还是对象
          // 4.建立新的数组或对象
          newTarget[prop] =
            Object.prototype.toString.call(origin[prop]) == "[object Array]"
              ? []
              : {};
          // 5.递归调用，实现多层拷贝
          this.deepClone(origin[prop], newTarget[prop]);
        } else {
          newTarget[prop] = origin[prop];
        }
      }
      return newTarget;
    },

    // 格式化日期
    formatDate(timeStamp) {
      let time = new Date(timeStamp),
        y = time.getFullYear(),
        m = time.getMonth() + 1,
        d = time.getDate(),
        h = time.getHours(),
        mm = time.getMinutes(),
        s = time.getSeconds(),
        w = time.getDay();
      // 为教室课表的 星期多选框 赋值
      this.search.classroomWeek = [w];
      switch (w) {
        case 0:
          w = "日";
          break;
        case 1:
          w = "一";
          break;
        case 2:
          w = "二";
          break;
        case 3:
          w = "三";
          break;
        case 4:
          w = "四";
          break;
        case 5:
          w = "五";
          break;
        case 6:
          w = "六";
          break;
      }

      return y + "-" + this.add0(m) + "-" + this.add0(d) + " " + "星期" + w;
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
    },

    // 判断当前时间属于第几周
    compareDate(date, weeklys) {
      let stamp = new Date(
        date.split(" ")[0].replace(/-/g, "/").replace(/-/, "/")
      ).getTime();

      if (weeklys) {
        weeklys.forEach((item) => {
          let start = new Date(
            item.beginDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();
          let end = new Date(
            item.endDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();

          if (start <= stamp && stamp <= end) {
            this.search.classroomWeekly = item.weekNum;
            this.search.teacherWeekly = item.weekNum;
            this.search.weekly = item.weekNum;
          }
        });
      }
    },

    // 将连续的周次合并
    formatWeekly(weekly) {
      if (weekly) {
        let result = [],
          result2 = [],
          i = 0;
        // 排序
        let min = null;
        for (let i = 0; i < weekly.length; i++) {
          for (let j = i; j < weekly.length; j++) {
            if (weekly[i] > weekly[j]) {
              min = weekly[j];
              weekly[j] = weekly[i];
              weekly[i] = min;
            }
          }
        }
        weekly.forEach((item, index) => {
          if (index === 0) {
            result[0] = [item];
          } else if (item - weekly[index - 1] === 1) {
            result[i].push(item);
          } else {
            result[++i] = [item];
          }
        });
        result.forEach((item) => {
          result2.push(`${item[0]}-${item[item.length - 1]}`);
        });
        return result2;
      }
    },
  },
  filters: {
    weekStrToCode: (value) => {
      switch (value) {
        case 1:
          return "星期一";
        case 2:
          return "星期二";
        case 3:
          return "星期三";
        case 4:
          return "星期四";
        case 5:
          return "星期五";
        case 6:
          return "星期六";
        case 7:
          return "星期七";
      }
    },
  },
  computed: {
    getCurTime() {
      let time = new Date().getTime();
      this.curTime = this.formatDate(time);
      // this.curTime = "2021-03-05 星期二";
      return this.curTime;
    },
    // 返回调课操作信息的数据格式化
    formatAdjustCourseInfoData() {
      return (data) => {
        if (data.teachName) {
          return `${data.teachName} > ${data.weekName} > ${data.week} > 第${data.sectionID}节 > ${data.course} > ${data.className} > ${data.classroom}`;
        } else if (data.msg) {
          return `${data.msg}`;
        }
        return "";
      };
    },
  },
  mounted() {
    // this.curTerm = JSON.parse(sessionStorage.currTerm)
    this.getTeacher();
    this.getClassName();
    this.getCourse();
    this.getWeekly();
    this.getBuilding();
    // this.getClassroom();
    this.getSection();
    this.compareDate(this.curTime, this.weeklys);
  },
};
</script>

<style>
.classScheduleOverview {
  width: 100%;
  padding: 20px 80px 0;
  height: 100%;
  background-color: #f3f8ff;
}

.classScheduleOverview .content {
  padding: 24px;
  padding-top: 32px;
  height: 754px;
  background-color: #fff;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.curTime::before {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.classScheduleOverview .ivu-table-header th,
.classScheduleOverview .ivu-table td.codeStyle {
  background-color: #f0faff;
}

.classScheduleOverview .ivu-table th {
  height: 62px;
}

.classScheduleOverview .ivu-table td {
  height: 82px;
}

.classScheduleOverview .teacherScheduleBox {
  display: flex;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse {
  width: 300px;
  height: 600px;
  background-color: #fff;
  margin-left: 32px;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  /* 不自动收缩 */
  flex-shrink: 0;
  position: relative;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo {
  text-align: left;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo,
.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToForm {
  padding: 24px 24px 0;
  /* height: 410px; */
  overflow-y: auto;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .footer {
  bottom: 32px;
  text-align: center;
  width: 100%;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToForm .footer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .title {
  background-color: #ff9d76;
  width: 100%;
  height: 48px;
  text-align: center;
  line-height: 48px;
  color: #fff;
}

.classScheduleOverview .teacherScheduleBox .content {
  padding: 0;
}

.classScheduleOverview .teacherScheduleBox .content .searchZone {
  background-color: #55a1ff;
  height: 48px;
  color: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .ivu-form-item {
  margin-bottom: 16px;
}

.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo .info {
  width: 100%;
  height: 60px;
  overflow-y: auto;
}

.blankBox .ivu-icon {
  width: 50px;
  height: 50px;
  display: none;
  font-size: 55px;
}

.blankBox:hover .ivu-icon {
  display: inline-block;
}
</style>
