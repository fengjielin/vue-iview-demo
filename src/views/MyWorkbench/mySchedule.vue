<template>
  <div class="mySchedule">
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

    <!-- 教师课表 -->
    <div v-if="activeIndex == 0" class="teacherScheduleBox">
      <div class="content">
        <div
          class="searchZone"
          style="display: flex; justify-content: space-between"
        >
          <div>
            <Icon type="md-person" style="font-size: 20px; margin-left: 32px" />
            {{ search.teacher }}
          </div>
          <div>
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
          </div>
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
        <div class="adjustToDefault" v-if="adjustTo == 0">当周调课信息：无</div>
        <div class="adjustToInfo" v-if="adjustTo == 1">
          <div>
            <div class="info">
              <p>姓名：{{ adjustCourseInfoData.adjustCourseObj.teachName }}</p>
              <p>
                节次：
                {{ adjustCourseInfoData.adjustCourseObj.weekName }}
                {{ adjustCourseInfoData.adjustCourseObj.week }}
                第{{ adjustCourseInfoData.adjustCourseObj.sectionID.toString() }}节
              </p>
              <p>班级：{{ adjustCourseInfoData.adjustCourseObj.className }}</p>
              <p>课程：{{ adjustCourseInfoData.adjustCourseObj.course }}</p>
              <p>地址：{{ adjustCourseInfoData.adjustCourseObj.classroom }}</p>
            </div>
          </div>

          <div>
            <div class="adjustTo">
              <div class="liner"></div>
              <div class="littleTitle">
                <span>调至</span>
              </div>
            </div>

            <div class="info">
              <p>
                节次：
                {{ adjustCourseInfoData.adjustCourseToObj.weekName }}
                {{ adjustCourseInfoData.adjustCourseToObj.week }}
                第{{ adjustCourseInfoData.adjustCourseToObj.sectionID ? adjustCourseInfoData.adjustCourseToObj.sectionID.toString() :''}}节
              </p>
              <p>
                地址：{{ adjustCourseInfoData.adjustCourseToObj.classroom }}
              </p>
            </div>
          </div>

          <div>
            <div class="info">
              <div class="isConflict">
                <Icon
                  :type="
                    conflict
                      ? 'ios-information-circle-outline'
                      : 'md-checkmark-circle-outline'
                  "
                />
                <p v-if="!conflict">无冲突信息</p>
                <p v-else>需要调至的教室已有课程，详情如下</p>
              </div>
              <div v-if="conflict">
                <p>
                  姓名：{{ adjustCourseInfoData.adjustCourseToObj.teachName }}
                </p>
                <p>
                  节次：
                  {{ adjustCourseInfoData.adjustCourseToObj.weekName }}
                  {{ adjustCourseInfoData.adjustCourseToObj.week }}
                  第{{ adjustCourseInfoData.adjustCourseToObj.sectionID ? adjustCourseInfoData.adjustCourseToObj.sectionID.toString() :'' }}节
                </p>
                <p>
                  班级：{{ adjustCourseInfoData.adjustCourseToObj.className }}
                </p>
                <p>课程：{{ adjustCourseInfoData.adjustCourseToObj.course }}</p>
                <p>
                  地址：{{ adjustCourseInfoData.adjustCourseToObj.classroom }}
                </p>
              </div>
            </div>
          </div>

          <div class="footer" v-if="adjustCourseInfoData.adjustCourseObj">
            <Checkbox>是否同步更新后续周次课表</Checkbox><br />
            <Button
              size="small"
              style="margin-right: 20px; background-color: #ff763f; color: #fff"
              @click="sendAdjustCourseInfo"
              :disabled="btnDisabled"
              >提出调课申请</Button
            >
            <Button
              size="small"
              style="color: #ff763f; border: 1px solid #ff4900"
              @click="removeAdjustCourseTo"
              >取消</Button
            >
          </div>
        </div>
        <div class="adjustToForm" v-if="adjustTo == 2">
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
                    >{{ item.name }}
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
                  {{item.weekName}}
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
              >提交申请</Button
            >
            <Button
              size="small"
              style="color: #ff763f; border: 1px solid #ff4900"
              @click="adjustTo = 0"
              >取消</Button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 教室课表 -->
    <div class="content" v-if="activeIndex == 1" style="overflow-y: auto">
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
              :label="item"
              v-for="(item, index) in weeks"
              :key="index"
              :disabled="search.classroomWeek[0] == item"
            ></Checkbox>
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
              >{{ item.buildingName }}</Option
            >
          </Select>
        </div>
      </div>
      <Table
        ref="table"
        :disabled-hover="true"
        :columns="classroomScheduleColumns"
        :data="classroomScheduleData"
        border
        height="636"
        :span-method="handleSpan"
      ></Table>
    </div>

    <!-- 班级周课表 -->
    <div class="content" v-if="activeIndex == 2">
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
          v-model="search.className"
          @on-change="searchClassSchedule"
          style="width: 200px"
          clearable
        >
          <Option
            :value="item.teachingClassName"
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
import allSectionJSON from "../../json/allSection2.json";
import teacherScheduleJSON from "../../json/teacherScheduleData.json";
import teacherScheduleJSON2 from "../../json/teacherScheduleData1.json";
import classScheduleJSON from "../../json/classScheduleItems2.json";
import buildingsJSON from "../../json/buildings.json";
import classroomListJSON from "../../json/classroomList.json";

export default {
  data() {
    return {
      // 按钮组
      btn: ["教师课表", "教室课表", "班级周课表"],
      // 用于控制选择了那个按钮
      activeIndex: 0,

      loading: false,

      // 控制调课操作信息的切换 0 默认页， 1 调至信息页， 2 添加表单页
      adjustTo: 0,
      // 是否有冲突
      conflict: false,

      // 控制调课操作信息的确认按钮的可用状态
      btnDisabled: true,

      // 当前的时间
      curTime: "",

      // 调课操作信息中的绑定数据
      adjustCourseInfoData: {
        adjustCourseObj: "",
        adjustCourseToObj: "",
      },
      adjustCourseData: {
        courseId: "",
        classNameId: "",
        classroomId:'',
        week: "",
        section: [],
        weekly: [],
      },

      // 教师课表 表格绑定的数据
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
      teacherScheduleItems: [],

      // 教室课表
      classroomScheduleColumns: [{}],
      classroomScheduleData: [],
      classroomScheduleItems: [],

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
      classScheduleItems: [],

      // 表格上方的搜索
      search: {
        teacherWeekly: "",
        teacher: "张三",

        classroomWeekly: "",
        classroomWeek: [],
        buildingId: 1,

        weekly: "",
        className: "",
      },

      // 教师课表 表格单元格是否进行了已经点击操作，false为已经点击
      again: true,

      // 节次
      allSection: [],

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

      // 星期
      weeks: [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日",
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
    // 切换按钮
    changeBtn(index) {
      this.activeIndex = index;
      // 0：教师课表，1：教室课表；2：班级周课表
      switch (index) {
        case 0:
          console.log("教师课表");
          this.getSchedule();
          break;
        case 1:
          console.log("教室课表");
          this.setWeekClassroomSchedule();
          break;
        case 2:
          console.log("班级周课表");
          this.getSchedule();
          break;
      }
    },

    // 教室课表的星期多选框 
    setWeekClassroomSchedule() {
      console.log(this.search.classroomWeek);
      let week = null;
      this.classroomScheduleColumns = [];
      this.search.classroomWeek.forEach((item, i) => {
        switch (item) {
          case "星期一":
            week = "week1";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期二":
            week = "week2";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期三":
            week = "week3";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期四":
            week = "week4";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期五":
            week = "week5";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期六":
            week = "week6";
            this.setCourseInTable(item, i, week, item);
            break;
          case "星期日":
            week = "week7";
            this.setCourseInTable(item, i, week, item);
            break;
        }
      });
      this.getSchedule();
    },

    // 不同的星期应该在表格中生成不同的课程
    setCourseInTable(item, i, week, weekStr) {
      if (i == 0) {
        let weekClassroomSchedule = {
          title: this.search.classroomWeek[0],
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
                params.row
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      } else {
        let weekClassroomSchedule = {
          title: item,
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
                params.row
              );
            },
          };
          weekClassroomSchedule.children.push(code);
        });
        this.classroomScheduleColumns.push(weekClassroomSchedule);
      }
    },
    // 渲染教室课表的表格
    getClassroomColumns(h, params, week, section, row) {
      let curWeek = row[week] ? row[week][section] : "";
      let temp = null;
      temp = h("div", [
        curWeek
          ? h("div", [
              h("div", curWeek.className),
              h(
                "div",
                `${curWeek.course}(${this.formatWeekly(curWeek.weekly)})`
              ),
              h("div", curWeek.teachName),
            ])
          : "",
      ]);
      return temp;
    },

    // 渲染表格
    getColumns(h, params, num, curWeek) {
      let temp = null;
      if (this.activeIndex == 0) {
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
                                  this.adjustTo = 1;
                                  this.again = false;
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
                                },
                              },
                            },
                            "调至"
                          )
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
                              this.conflict = true;
                              this.adjustCourseInfoData.adjustCourseToObj =
                                params.row[params.column.key];
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
                                  this.adjustTo = 2;
                                  this.adjustCourseData.week =
                                    params.column._index;

                                  this.adjustCourseData.section = [];
                                  this.adjustCourseData.section.push(
                                    params.row.code
                                  );

                                  this.adjustCourseData.weekly = [this.search.teacherWeekly]
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
      } else if (this.activeIndex == 1) {
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
      this.teacherScheduleItems.forEach((e) => {
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

      console.log(adjustCourseToObj)
      if (
        adjustCourseToObj.sectionID[adjustCourseToObj.sectionID.length - 1] >
        this.allSection.length
      ) {
        this.adjustCourseInfoData.adjustCourseToObj = {
          msg: "节次已超过所设定的最大节次数",
        };
        this.btnDisabled = true;
        // this.conflict = true;
      } else {
        this.adjustCourseInfoData.adjustCourseToObj = adjustCourseToObj;
      }
    },

    // 调课操作信息中的取消事件
    removeAdjustCourseTo() {
      this.again = true;
      this.conflict = false;
      this.adjustTo = 0;
      this.adjustCourseInfoData.adjustCourseObj = "";
      this.adjustCourseInfoData.adjustCourseToObj = "";
      this.getSchedule();
    },

    // 调课操作信息中的确认事件
    sendAdjustCourseInfo() {
      this.again = true;
      this.btnDisabled = true;

      let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj;
      let adjustCourseToObj = this.adjustCourseInfoData.adjustCourseToObj;

      // 后端
      // let index = this.teacherScheduleItems.findIndex((item) => {
      //   return item.id == adjustCourseObj.id;
      // });
      // let obj = this.teacherScheduleItems.splice(index, 1);

      // obj[0].week = adjustCourseToObj.week;
      // obj[0].section = adjustCourseToObj.section;
      // obj[0].sectionID = adjustCourseToObj.sectionID;

      // this.teacherScheduleItems.push(obj[0]);

      this.$Message.success("申请已提交");
      this.getSchedule();
      this.removeAdjustCourseTo();
    },

    // 调课操作信息中的表单确认事件
    sendAdjustToForm() {
      this.adjustCourseData.teachName = this.search.teacher;
      this.adjustTo = false;
      this.$Message.success("申请已提交");
      this.getSchedule();
    },

    // 获取课程安排数据
    getSchedule() {
      if (this.activeIndex == 0) {
        // 教师课表
        this.teacherScheduleData = [];
        let allSection = this.deepClone(this.allSection);
        if (this.teacherScheduleItems.length == 0) {
          this.teacherScheduleItems = this.deepClone(teacherScheduleJSON);
        }
        this.formatscheduleData(this.teacherScheduleItems, allSection);
        this.teacherScheduleData = this.assembleData(allSection);
      } else if (this.activeIndex == 1) {
        // 教室课表
        this.classroomScheduleData = [];
        let classroomList = this.deepClone(this.classroomList);
        if (this.classroomScheduleItems.length == 0) {
          this.classroomScheduleItems = this.deepClone(classScheduleJSON);
        }

        this.classroomScheduleItems.forEach((item) => {
          this.search.classroomWeek.forEach((w) => {
            if (item.week === w) {
              let info = `${item.course},${item.teachName},${item.classroom},${item.className}`;
              classroomList.forEach((e) => {
                if (item.classroomID == e.id) {
                  switch (w) {
                    case "星期一":
                      e.week1 ? "" : (e.week1 = {});
                      e.week1[item.sectionID] = item;
                      if (!e.week1Str) {
                        e.week1Str = {};
                      }
                      e.week1Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期二":
                      e.week2 ? "" : (e.week2 = {});
                      e.week2[item.sectionID] = item;
                      if (!e.week2Str) {
                        e.week2Str = {};
                      }
                      e.week2Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期三":
                      e.week3 ? "" : (e.week3 = {});
                      e.week3[item.sectionID] = item;
                      if (!e.week3Str) {
                        e.week3Str = {};
                      }
                      e.week3Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期四":
                      e.week4 ? "" : (e.week4 = {});
                      e.week4[item.sectionID] = item;
                      if (!e.week4Str) {
                        e.week4Str = {};
                      }
                      e.week4Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期五":
                      e.week5 ? "" : (e.week5 = {});
                      e.week5[item.sectionID] = item;
                      if (!e.week5Str) {
                        e.week5Str = {};
                      }
                      e.week5Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期六":
                      e.week6 ? "" : (e.week6 = {});
                      e.week6[item.sectionID] = item;
                      if (!e.week6Str) {
                        e.week6Str = {};
                      }
                      e.week6Str["sectionStr" + item.sectionID] = info;
                      break;
                    case "星期日":
                      e.week7 ? "" : (e.week7 = {});
                      e.week7[item.sectionID] = item;
                      if (!e.week6Str) {
                        e.week6Str = {};
                      }
                      e.week6Str["sectionStr" + item.sectionID] = info;
                      break;
                  }
                }
              });
            }
          });
        });

        this.classroomScheduleData = classroomList;
      } else if (this.activeIndex == 2) {
        // 班级周课表
        this.classScheduleData = [];
        let allSection = this.deepClone(this.allSection);
        if (this.classScheduleItems.length == 0) {
          this.classScheduleItems = this.deepClone(classScheduleJSON);
        }
        this.formatscheduleData(this.classScheduleItems, allSection);
        this.classScheduleData = this.assembleData(allSection);
      }
    },

    // 格式化课程表的数据
    formatscheduleData(scheduleItems, allSection) {
      allSection.forEach((sectionItem) => {
        scheduleItems.forEach((scheduleItem) => {
          if (sectionItem.id == scheduleItem.sectionID) {
            // info 用于判断是否应该合并
            let info = `${scheduleItem.course},${scheduleItem.teachName},${scheduleItem.classroom},${scheduleItem.className}`;

            switch (scheduleItem.week) {
              case "星期一":
                sectionItem.week1 = scheduleItem;
                sectionItem.weekStr1 = info;
                break;
              case "星期二":
                sectionItem.week2 = scheduleItem;
                sectionItem.weekStr2 = info;
                break;
              case "星期三":
                sectionItem.week3 = scheduleItem;
                sectionItem.weekStr3 = info;
                break;
              case "星期四":
                sectionItem.week4 = scheduleItem;
                sectionItem.weekStr4 = info;
                break;
              case "星期五":
                sectionItem.week5 = scheduleItem;
                sectionItem.weekStr5 = info;
                break;
              case "星期六":
                sectionItem.week6 = scheduleItem;
                sectionItem.weekStr6 = info;
                break;
              case "星期日":
                sectionItem.week7 = scheduleItem;
                sectionItem.weekStr7 = info;
                break;
            }
          }
        });
      });
    },

    // 搜索操作
    searchClassSchedule() {
      if (this.search.teacher == "李四") {
        this.teacherScheduleItems = teacherScheduleJSON2;
      } else {
        this.teacherScheduleItems = teacherScheduleJSON;
      }
      this.getSchedule();
    },

    // 获取节次数据
    getSection() {
      this.allSection = allSectionJSON;
      this.getSchedule();
    },

    // 获取楼栋信息
    getBuilding() {
      this.buildings = buildingsJSON;
      this.getClassroom();
    },
    // 获取教室信息
    getClassroom() {
      this.classroomList = classroomListJSON;
    },

    // 表格合并的方法
    handleSpan({ row, column, rowIndex, columnIndex }) {
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
    },
    // 用于计算合并的规则
    assembleData(data) {
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

      // 为教室课表的 星期多选框 赋值
      this.search.classroomWeek = ["星期" + w];

      return y + "-" + this.add0(m) + "-" + this.add0(d) + " " + "星期" + w;
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
    },
    // 将连续的周次合并
    formatWeekly(weekly) {
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

    // 判断当前时间属于第几周
    compareDate(date, weeklys, curTerm) {
      let stamp = new Date(
        date.split(" ")[0].replace(/-/g, "/").replace(/-/, "/")
      ).getTime();

      // 根据当前学期判断
      if (curTerm) {
        curTerm.forEach((item) => {
          let start = new Date(
            item.beginDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();
          let end = new Date(
            item.endDate.replace(/-/g, "/").replace(/-/, "/")
          ).getTime();
          if (start <= stamp && stamp <= end) {
            this.curTerm = item;
          }
        });
      }

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
  },
  computed: {
    getCurTime() {
      let time = new Date().getTime();
      this.curTime = this.formatDate(time);
      return this.curTime;
    },

    // 返回教师课表中调课操作信息的数据格式化
    formatAdjustCourseInfoData() {
      return (data) => {
        if (data.teachName) {
          return `${data.teachName} > ${data.week} > ${data.section} > ${data.course} > ${data.className} > ${data.classroom}`;
        } else if (data.msg) {
          return `${data.msg}`;
        }
        return "";
      };
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
  mounted() {
    this.getSection();
    this.getBuilding();
    this.compareDate(this.curTime, this.weeklys);
  },
};
</script>

<style>
.mySchedule {
  width: 100%;
  padding: 20px 80px 0;
  height: 100%;
  background-color: #f3f8ff;
}

.mySchedule .content {
  padding: 24px;
  padding-top: 32px;
  height: 754px;
  background-color: #fff;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  /* 令容器不会被表格撑开，并限制表格超过宽度，出现下方滚动条 */
  overflow: hidden;
}

.curTime::before {
  /* 令当前时间居中显示 */
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.mySchedule .ivu-table-header th,
.mySchedule .ivu-table td.codeStyle {
  background-color: #f0faff;
}

.mySchedule .ivu-table th {
  height: 62px;
}

.mySchedule .ivu-table td {
  height: 82px;
}

.mySchedule .teacherScheduleBox .content {
  padding: 0;
}

.mySchedule .teacherScheduleBox {
  display: flex;
}

.mySchedule .teacherScheduleBox .searchZone {
  background-color: #55a1ff;
  height: 48px;
  color: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.mySchedule .teacherScheduleBox .adjustCourse {
  width: 300px;
  /* height: 506px; */
  background-color: #fff;
  margin-left: 32px;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  /* 不自动收缩 */
  flex-shrink: 0;
  position: relative;
}

.mySchedule .adjustCourse .title {
  background-color: #ff9d76;
  width: 100%;
  height: 48px;
  text-align: center;
  line-height: 48px;
  color: #fff;
}

.mySchedule .teacherScheduleBox .adjustCourse .ivu-form-item {
  margin-bottom: 16px;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustTo {
  width: 100%;
  height: 22px;
  position: relative;
  margin: 30px 0;
}
.mySchedule .teacherScheduleBox .adjustCourse .liner {
  width: 100%;
  height: 1px;
  background-color: #ff4900;
  position: relative;
  top: 50%;
}
.mySchedule .teacherScheduleBox .adjustCourse .littleTitle {
  text-align: center;
  width: 70px;
  height: 22px;
  line-height: 22px;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
  z-index: 3;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToInfo .info {
  width: 100%;
  overflow-y: auto;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToInfo .isConflict {
  text-align: center;
  color: #ff4900;
  margin: 40px 0 30px;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToInfo .isConflict i {
  font-size: 24px;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToInfo {
  text-align: left;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToInfo,
.mySchedule .teacherScheduleBox .adjustCourse .adjustToForm {
  padding: 24px 24px 0;
  /* height: 410px; */
  overflow-y: auto;
}

.mySchedule .teacherScheduleBox .adjustCourse .footer {
  text-align: center;
  margin-top: 50px;
  width: 100%;
}

.mySchedule .teacherScheduleBox .adjustCourse .adjustToDefault {
  text-align: center;
  margin-top: 160px;
}

.mySchedule
  .teacherScheduleBox
  .adjustCourse
  .adjustToInfo
  .ivu-checkbox-inner {
  width: 14px;
  height: 14px;
  border: 1px solid #ff4900;
}
</style>