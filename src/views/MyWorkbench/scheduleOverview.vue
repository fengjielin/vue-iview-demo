<template>
	<div class="classScheduleOverview">
		<ButtonGroup style="margin-bottom: 24px; display: flex; justify-content: center">
			<Button v-for="(item, index) in btn" :key="index" :type="activeIndex == index ? 'primary' : 'default'"
				@click="changeBtn(index)">{{ item }}
			</Button>
		</ButtonGroup>

		<!-- 教室课表 -->
		<div class="content" v-if="activeIndex == 0" style="overflow-y: auto">
			<div class="searchZone" style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        ">
				<div>
					<span class="curTime">当前时间：{{ getCurTime }}</span>
					<Select v-model="search.classroomWeekly" style="width: 88px; margin-left: 10px; margin-right: 10px"
						@on-change="searchClassSchedule">
						<Option :value="item.weekNum" v-for="(item, index) in cutOutWeekly" :key="index">
							{{ item.weekName }}
						</Option>
					</Select>
					<CheckboxGroup style="display: inline-block" v-model="search.classroomWeek"
						@on-change="getSchedule">
						<Checkbox :label="item.code" v-for="(item, index) in weeks" :key="index"
							:disabled="search.classroomWeek[0] == item.code">{{ item.str }}</Checkbox>
					</CheckboxGroup>
				</div>
				<div>
					<Select style="width: 200px; margin-right: 10px" placeholder="请选择楼栋" v-model="search.buildingId"
						@on-change="searchClassSchedule">
						<Option :value="item.id" v-for="(item, index) in buildings" :key="index">{{ item.buildingName }}
						</Option>
					</Select>
					<Button type="primary" @click="exportData">
						<Icon type="ios-download-outline"></Icon>导出教室总表
					</Button>
				</div>
			</div>

			<div id="table_box">
				<Table ref="table" :loading="loading" :disabled-hover="true" :columns="classroomScheduleColumns"
					:data="classroomScheduleData" border height="636" class="classroomTable" :span-method="handleSpan">
				</Table>
			</div>
			<!-- 添加上课信息 -->
			<Modal v-model="classroomModal" :title="title">
				<Form :model="classroomModelData" :label-width="88">
					<FormItem label="班级名称:">
						<Select size="small" v-model="classroomModelData.teachingClassNameId" style="width: 160px">
							<Option :value="item.id" v-for="(item, index) in classNames" :key="index">
								{{ item.teachingClassName }}
							</Option>
						</Select>
					</FormItem>
					<FormItem label="节次:">
						<div>
							<CheckboxGroup v-model="classroomModelData.section">
								<Checkbox :label="item.code" v-for="(item, index) in allSection" :key="index">
									{{ item.name }}
								</Checkbox>
							</CheckboxGroup>
						</div>
					</FormItem>
					<FormItem label="适用周次:">
						<div>
							<CheckboxGroup v-model="classroomModelData.weekly">
								<Checkbox :label="item.weekNum" v-for="(item, index) in cutOutWeekly" :key="index">
									{{ item.weekName }}
								</Checkbox>
							</CheckboxGroup>
						</div>
					</FormItem>
				</Form>
				<div slot="footer" style="text-align: center">
					<Button @click="cancel">取消</Button>
					<Button type="primary" @click="ok">添加</Button>
				</div>
			</Modal>
		</div>

		<!-- 教师课表 -->
		<div v-if="activeIndex == 1" class="teacherScheduleBox">
			<div class="content">
				<div class="searchZone">
					<span class="curTime">当前时间：{{ getCurTime }}</span>
					<Select @on-change="searchClassSchedule" v-model="search.teacherWeekly"
						style="width: 160px; margin-left: 10px; margin-right: 10px">
						<Option :value="item.weekNum" v-for="(item, index) in cutOutWeekly" :key="index">
							{{ item.weekName }}
						</Option>
					</Select>
					<Select filterable @on-change="searchClassSchedule" v-model="search.teacherId"
						style="width: 160px; margin-left: 10px; margin-right: 10px">
						<Option :value="item.id" v-for="(item, index) in teacherList" :key="index">{{ item.xm }}
						</Option>
					</Select>
				</div>
				<div style="overflow-y: auto; height: 92%;">
					<Table :disabled-hover="true" border :loading="loading" :columns="teacherScheduleColumns"
						:data="teacherScheduleData" :span-method="handleSpan" style="margin: 32px 24px 0px"></Table>
				</div>
			</div>
			<div class="adjustCourse">
				<div class="title">调课操作信息</div>

				<div class="adjustToDefault" v-if="adjustTo == 0"></div>
				<div class="adjustToInfo" v-if="adjustTo == 1">
					<div>
						<div class="info">
							<p>姓名：{{ adjustCourseInfoData.adjustCourseObj.teacherName }}</p>
							<p>
								节次：
								{{ adjustCourseInfoData.adjustCourseObj.weekName }}
								{{ adjustCourseInfoData.adjustCourseObj.week }}
								<span
									v-if="adjustCourseInfoData.adjustCourseObj.sectionID">第{{ adjustCourseInfoData.adjustCourseObj.sectionID ? adjustCourseInfoData.adjustCourseObj.sectionID.toString() :''}}节</span>
							</p>
							<p>班级：{{ adjustCourseInfoData.adjustCourseObj.teacherClassName }}</p>
							<p>课程：{{ adjustCourseInfoData.adjustCourseObj.courseName }}</p>
							<p>地址：{{ adjustCourseInfoData.adjustCourseObj.className }}</p>
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
								<span
									v-if="adjustCourseInfoData.adjustCourseToObj.sectionID">第{{ adjustCourseInfoData.adjustCourseToObj.sectionID ? adjustCourseInfoData.adjustCourseToObj.sectionID.toString() :''}}节</span>
							</p>
							<p>
								地址：{{ adjustCourseInfoData.adjustCourseToObj.className }}
							</p>
						</div>
					</div>

					<div>
						<div class="info">
							<div class="isConflict">
								<Icon :type="
				        conflict
				          ? 'ios-information-circle-outline'
				          : 'md-checkmark-circle-outline'
				      " />
								<p v-if="!conflict">无冲突信息</p>
								<p v-if="adjustCourseInfoData.sq_arrangementMsg">{{adjustCourseInfoData.sq_arrangementMsg}}</p>
								<p v-if="adjustCourseInfoData.bt_arrangementMsg">{{adjustCourseInfoData.bt_arrangementMsg}}</p>
							</div>
							<div v-if="adjustCourseInfoData.conflictScheduleObj">
								<p>
									姓名：{{ adjustCourseInfoData.conflictScheduleObj.teacherName }}
								</p>
								<p>
									节次：
									{{adjustCourseInfoData.conflictScheduleObj.weekName}}
									星期{{ adjustCourseInfoData.conflictScheduleObj.week }}
									第{{adjustCourseInfoData.conflictScheduleObj.section.toString() }}节
								</p>
								<p>
									班级：{{ adjustCourseInfoData.conflictScheduleObj.teacherClassName }}
								</p>
								<p>课程：{{ adjustCourseInfoData.conflictScheduleObj.courseName }}</p>
								<p>
									地址：{{ adjustCourseInfoData.conflictScheduleObj.className }}
								</p>
							</div>
						</div>
					</div>

					<div class="footer" v-if="adjustCourseInfoData.adjustCourseObj">
						<Checkbox v-model="isSync">是否同步更新后续周次课表</Checkbox><br />
						<Button size="small" style="margin-right: 20px; background-color: #ff763f; color: #fff"
							v-text="conflict ? '强制调课' : '确定调课'" @click="sendAdjustCourseInfo"
							:disabled="btnDisabled"></Button>
						<Button size="small" style="color: #ff763f; border: 1px solid #ff4900"
							@click="removeAdjustCourseTo">取消</Button>
					</div>
				</div>
				<div class="adjustToForm" v-if="adjustTo == 2">
					<Form :model="adjustCourseData" :label-width="55" ref="adjustCourseDataRef">
						<FormItem label="课程:">
							<Select size="small" v-model="adjustCourseData.courseId" style="width: 160px">
								<Option :value="item.id" v-for="(item, index) in courseList" :key="index">
									{{ item.courseName }}
								</Option>
							</Select>
						</FormItem>
						<FormItem label="班级:">
							<Select size="small" v-model="adjustCourseData.classNameId" style="width: 160px">
								<Option :value="item.id" v-for="(item, index) in classNames" :key="index">
									{{ item.teachingClassName }}
								</Option>
							</Select>
						</FormItem>
						<FormItem label="教室:">
							<Select size="small" v-model="search.buildingId" style="width: 160px" placeholder="请选择楼栋"
								@on-change="getClassroom">
								<Option :value="item.id" v-for="(item, index) in buildings" :key="index">
									{{ item.buildingName }}
								</Option>
							</Select>
							<Select size="small" v-model="adjustCourseData.classroomId" style="width: 160px"
								placeholder="请选择教室">
								<Option :value="item.id" v-for="(item, index) in classroomList" :key="index">
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
									<Checkbox :label="item.code" v-for="(item, index) in allSection" :key="index">
										{{ item.name }}
									</Checkbox>
								</CheckboxGroup>
							</div>
						</FormItem>
						<FormItem label="周次:">
							<div style="height: 100px; overflow-y: auto">
								<CheckboxGroup v-model="adjustCourseData.weekly">
									<Checkbox :label="item.weekNum" v-for="(item, index) in cutOutWeekly" :key="index">
										{{item.weekName}}
									</Checkbox>
								</CheckboxGroup>
							</div>
						</FormItem>
					</Form>
					<div class="footer">
						<Button size="small" style="margin-right: 20px; background-color: #ff763f; color: #fff"
							@click="sendAdjustToForm">提交申请</Button>
						<Button size="small" style="color: #ff763f; border: 1px solid #ff4900"
							@click="adjustTo = 0">取消</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- 班级周课表 -->
		<div class="content" v-if="activeIndex == 2" style="overflow-y: auto">
			<!-- 表格上方功能区 -->
			<div class="searchZone" style="display: flex; justify-content: flex-end; margin-bottom: 10px">
				<span class="curTime">当前时间：{{ getCurTime }}</span>
				<Select @on-change="searchClassSchedule" v-model="search.weekly"
					style="width: 160px; margin-left: 10px; margin-right: 10px">
					<Option :value="item.weekNum" v-for="(item, index) in cutOutWeekly" :key="index">{{ item.weekName }}
					</Option>
				</Select>
				<Select v-model="search.classNameId" @on-change="searchClassSchedule" style="width: 200px">
					<Option :value="item.id" v-for="(item, index) in classNames" :key="index">
						{{ item.teachingClassName }}
					</Option>
				</Select>
			</div>
			<!-- 表格区域 -->
			<div style="overflow-y: auto;">
				<Table :disabled-hover="true" border :loading="loading" :columns="classScheduleColumns"
					:data="classScheduleData" :span-method="handleSpan"></Table>
			</div>
		</div>
	</div>
</template>

<script>
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
				adjustTo: 0,
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
					buildingId: '',

					weekly: "",
					classNameId: "",

					teacherWeekly: "",
					teacherId: "",
				},

				// 教室课表
				classroomScheduleColumns: [],

				classroomScheduleData: [],

				// 教师课表
				teacherScheduleColumns: [{
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
				classScheduleColumns: [{
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
					conflictScheduleObj: "",
					sq_arrangementMsg:'',
					bt_arrangementMsg:''
				},

				// 教室课表 添加上课信息弹窗中的绑定数据
				classroomModelData: {
					teachingClassNameId: 1,
					section: [],
					weekly: [],
					week: ''
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
				// 当前周次
				curWeekly: '',
				// 截取当前周次以及后面的周次
				cutOutWeekly: [],

				// 教师列表
				teacherList: [],

				// 星期
				weeks: [{
						code: 1,
						str: "星期一"
					},
					{
						code: 2,
						str: "星期二"
					},
					{
						code: 3,
						str: "星期三"
					},
					{
						code: 4,
						str: "星期四"
					},
					{
						code: 5,
						str: "星期五"
					},
					{
						code: 6,
						str: "星期六"
					},
					{
						code: 7,
						str: "星期日"
					},
				],

				// 周次
				weeklys: [],

				// 楼栋信息
				buildings: [],

				// 教室信息
				classroomList: [],

				// 课程信息
				courseList: [],

				// 班级信息
				classNames: [],
				conflictSchedule: [],
				
				sortClassroomWeek:[]
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
				this.sortClassroomWeek = classroomWeek
				let week = null;
				this.classroomScheduleColumns = [];
				classroomWeek.forEach((item, i) => {
					switch (item) {
						case 1:
							week = "week1";
							this.setCourse(item, i, week, "星期一");
							break;
						case 2:
							week = "week2";
							this.setCourse(item, i, week, "星期二");
							break;
						case 3:
							week = "week3";
							this.setCourse(item, i, week, "星期三");
							break;
						case 4:
							week = "week4";
							this.setCourse(item, i, week, "星期四");
							break;
						case 5:
							week = "week5";
							this.setCourse(item, i, week, "星期五");
							break;
						case 6:
							week = "week6";
							this.setCourse(item, i, week, "星期六");
							break;
						case 7:
							week = "week7";
							this.setCourse(item, i, week, "星期日");
							break;
					}
				});
			},

			// 不同的星期应该生成不同的课程，不应该放在一起，会出现点击多个星期出现同样的课程安排
			setCourse(item, i, week, str) {
				if (i == 0) {
					let weekClassroomSchedule = {
						title: str,
						align: "center",
						children: [{
							title: "",
							key: "className",
							align: "center",
							width: 120,
							renderHeader: (h, params) => {
								return h(
									"div", {
										style: {
											width: "100%",
											height: "100%",
											display: "flex",
											"flex-direction": "column",
										},
									},
									[
										h(
											"strong", {
												style: {
													"margin-left": "40px",
												},
											},
											"节次"
										),

										h(
											"strong", {
												style: {
													"margin-right": "40px",
												},
											},
											"地点"
										),
										h(
											"strong", {
												style: {
													position: "absolute",
													transform: "rotate(30deg) translateY(-20px) translateX(-6px)",
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
						}, ],
					};
					this.allSection.forEach((e) => {
						let code = {
							title: e.name,
							key: e.code,
							align: "center",
							minWidth: 90,
							render: (h, params) => {
								return this.getClassroomColumns(
									h,
									params,
									week,
									e.code,
									params.row,
									str,
									item
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
							title: e.name,
							key: e.code,
							align: "center",
							minWidth: 90,
							render: (h, params) => {
								return this.getClassroomColumns(
									h,
									params,
									week,
									e.code,
									params.row,
									str,
									item
								);
							},
						};
						weekClassroomSchedule.children.push(code);
					});
					this.classroomScheduleColumns.push(weekClassroomSchedule);
				}
			},

			// 教室课表，往单元格中渲染固定格式的信息
			getClassroomColumns(h, params, week, section, row, weekStr, item) {
				// 根据先前封装的数据中不同的情况渲染不一样的东西
				let curWeek = row[week] ? row[week][section] : "";
				let temp = null;
				temp = h("div", [
					curWeek.id ?
					h("div", [
						h("div", curWeek.teacherClassName),
						h(
							"div",
							`${curWeek.courseName}(${this.formatWeekly(curWeek.weeklyTotal)})`
						),
						h("div", curWeek.teacherName),
					]) :
					h(
						"div", {
							attrs: {
								class: "blankBox",
							},
							style: {
								cursor: "pointer",
								height: "60px",
							},
							on: {
								click: () => {
									this.showClassroomModel(params, weekStr, item);
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
			showClassroomModel(row, weekStr, weekCode) {
				console.log(row)
				let toWeekly = this.weeklys.find(
					(item) => item.weekNum == this.search.teacherWeekly
				);
				this.title = `添加上课信息 ( ${row.row.className} ${toWeekly.weekName} ${weekStr} ${row.column.title})`;

				let section = this.allSection.find(item => item.name == row.column.title).code

				this.classroomModelData.className = "";
				this.classroomModelData.section = [section];
				this.classroomModelData.weekly = [this.search.classroomWeekly];
				this.classroomModelData.week = weekCode
				this.classroomModelData.classroom_id = row.row.id
				this.classroomModal = true;
			},
			// 教室课表的对话框的确定跟取消
			ok() {
				let classroomModelData = this.classroomModelData
				if (classroomModelData.teachingClassNameId && classroomModelData.section.length != 0 && classroomModelData
					.weekly.length != 0) {
					let teachingClassName = this.classNames.find(
						(item) => item.id == classroomModelData.teachingClassNameId
					);
					classroomModelData.section.sort((a, b) => a - b)
					let isContinuous = this.sectionIsContinuous(classroomModelData.section)
					let data = {
						scheduleId: "", //课表Id 新增则无，调课有
						to_weekly: classroomModelData.weekly.toString(), //调至周次 1,2,3
						to_week: classroomModelData.week, //调至星期
						to_section: classroomModelData.section.toString(), //调至节次 5,6
						to_classroom_id: classroomModelData.classroom_id, //调至教室
						teaching_class: teachingClassName.teachingClassName, //教学班
						teaching_class_id: classroomModelData.teachingClassNameId, //教学班
						teaching_teacher_id: teachingClassName.teachingTeacherId, //调至教师ID
						teaching_teacher_name: teachingClassName.teacherName,
						course_name: teachingClassName.courseName, //课程
						course_id: teachingClassName.courseId, //课程ID
						term_id: JSON.parse(sessionStorage.currTerm).id, //学期
						tkType: "T02", //临时调课T01 新增T02  影响后续的永久调课T03
						addWay: 'classroom'
					};

					console.log(data)
					if (isContinuous) {
						this.adjustTo = 0;
						this.classesInOperation(data);
						this.classroomModal = false
					} else {
						this.$Message.warning('所选节次需要连续，请重新选择');
					}
				} else {
					this.$Modal.warning({
						title: '提示',
						content: "提交的表单不完整，请填充完整"
					});
				}
			},

			cancel() {
				this.classroomModal = false
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
						?
						h(
							"Dropdown", {
								props: {
									transfer: true,
									trigger: "click",
								},
							},
							[
								h(
									"div", {
										style: {
											cursor: "pointer",
											margin: "8px 0",
										},
									},
									[
										h(
											"div",
											curWeek.courseName +
											"," +
											curWeek.teacherName
										),
										h("div", this.formatWeekly(curWeek.weeklyTotal).join(',')),
										h("div", curWeek.buildingName + "," + curWeek.className),
										h("div", curWeek.teacherClassName),
									]
								),
								this.again // 判断当前点击的单元格是第一次点击还是第二次点击
								?
								h(
									"DropdownMenu", {
										slot: "list",
									},
									[
										h(
											"DropdownItem", {
												nativeOn: {
													click: () => {
														this.adjustTo = 1;
														this.again = false;
														this.courseTo(params)
													},
												},
											},
											"调至"
										),
										h(
											"DropdownItem", {
												nativeOn: {
													click: () => {
														this.removeCourse(
															params.row[params.column.key], params
														);
													},
												},
											},
											"移除"
										),
									]
								) :
								h(
									"div", {
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

												this.isConflict(params, true)
											},
										},
									},
									""
								),
							]
						) :
						h(
							"Dropdown", {
								props: {
									transfer: true,
									trigger: "click",
								},
							},
							[
								h(
									"div", {
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
								this.again ?
								h(
									"DropdownMenu", {
										slot: "list",
									},
									[
										h(
											"DropdownItem", {
												nativeOn: {
													click: () => {
														this.adjustTo = 2;
														this.addition(params, this.adjustCourseData)
													},
												},
											},
											"添加"
										),
									]
								) :
								h(
									"div", {
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
						curWeek ?
						h(
							"div", {
								style: {
									margin: "8px 0",
								},
							},
							[
								h(
									"div",
									curWeek.courseName +
									"," +
									this.formatWeekly(curWeek.weeklyTotal).join(',') +
									"," +
									curWeek.teacherName
								),
								h("div", curWeek.buildingName + "," + curWeek.className),
								h("div", curWeek.teacherClassName),
							]
						) :
						"",
					]);
				}
				return temp;
			},

			// 调至
			courseTo(params) {
				let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj
				adjustCourseObj =
					params.row[params.column.key];

				adjustCourseObj[
						`weekStr${params.column._index}`
					] =
					params.row[
						`weekStr${params.column._index}`
					];
				adjustCourseObj.week = this.weeks.find((item) => item.code == adjustCourseObj.week).str
				adjustCourseObj.weekName = this.weeklys.find((item) => item.weekNum == adjustCourseObj.weekly).weekName
				
				
				let info =
					`${adjustCourseObj.courseName},${adjustCourseObj.teacherName},${adjustCourseObj.className},${adjustCourseObj.teacherClassName}`;
				let sectionArr = this.isMerge(params, info, adjustCourseObj.section)
				adjustCourseObj.sectionID = sectionArr
				this.adjustCourseInfoData.adjustCourseObj = adjustCourseObj
			},
			// 添加
			addition(params, adjustCourseData) {
				adjustCourseData.week =
					params.column._index;
				adjustCourseData.section = [];
				adjustCourseData.section.push(
					params.row.code
				);
				adjustCourseData.weekly = [
					this.search.teacherWeekly,
				];
				this.getClassName()
				this.getCourse();
			},

			// 判断选择调至的课程是否为合并的课程
			isMerge(course, info, section) {
				let curWeekStr = info;
				let weekStr = `weekStr${course.column._index}`;
				console.log(curWeekStr, weekStr)
				// 首先判断section的上一行跟下一行是否有值
				let sectionID = [];
				let index = this.teacherScheduleData.findIndex(item => item.code == section)
				if((this.teacherScheduleData[index + 1]&&this.teacherScheduleData[index + 1][weekStr]==curWeekStr) || (this.teacherScheduleData[index - 1]&&this.teacherScheduleData[index - 1][weekStr]==curWeekStr)){
					this.teacherScheduleData.forEach((item,i) => {
						let mergeCol = item[`week${course.column._index}MergeCol`]
						if (item[weekStr] == curWeekStr && mergeCol !== undefined && mergeCol != 1 && item[course.column.key]) {
							sectionID.push(item.code);
						}
					});
				}
				
				if (sectionID.length == 0 && section) {
					sectionID.push(section)
				}
				return sectionID;
			},

			// 调课操作是否发生冲突
			isConflict(params, isConflict) {
				this.conflict = false;
				let adjustCourseToObj = null
				adjustCourseToObj = this.deepClone(
					this.adjustCourseInfoData.adjustCourseObj, {}
				);
				let toWeekly = this.weeklys.find(
					(item) => item.weekNum == this.search.teacherWeekly
				);
				let toWeek = this.weeks.find((item) => item.str == params.column.title)

				adjustCourseToObj.weekName = toWeekly.weekName;
				adjustCourseToObj.weekCode = toWeek.code; // 星期
				adjustCourseToObj.weekNum = this.search.teacherWeekly; //周次
				adjustCourseToObj.week = params.column.title;
				adjustCourseToObj.section = params.row.name;

				// 计算调至第几节
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

				if (
					adjustCourseToObj.sectionID[adjustCourseToObj.sectionID.length - 1] >
					this.allSection.length
				) {
					this.$Message.error('节次已超过所设定的最大节次数')
					this.btnDisabled = true;
				} else {
					this.adjustCourseInfoData.adjustCourseToObj = adjustCourseToObj;
					if (!isConflict) {
						adjustCourseToObj.sectionID.forEach(item => {
							let to_section = this.teacherScheduleData.find(section => section.code == item)
							if (to_section[`week${adjustCourseToObj.weekCode}`]) {
								this.btnDisabled = true;
								this.$Modal.warning({
									title: '提示',
									content: `${to_section.name} 出现冲突`
								});
							}
						})
						/**
						 * 查找冲突课表数据
						 *
						 * @param teaching_class_id 需调课的班级Id
						 * @param weekly 需调至的周次
						 * @param week 需调至星期
						 * @param section 需调至节次
						 * @param classroom_id 调至教室
						 * @param term_id 学期
						 * @param scheduleInfoId 需调课的课表Id
						 *				
						 * @return 单条冲突数据
						 * TKScheduleOverview/checkeConflictSchedule
						 */
						let data = {
							scheduleInfoId: this.adjustCourseInfoData.adjustCourseObj.id,
							teaching_class_id: this.adjustCourseInfoData.adjustCourseObj.teaching_class_id,
							weekly: this.search.classroomWeekly,
							week: params.column._index,
							section: adjustCourseToObj.sectionID,
							classroom_id: this.adjustCourseInfoData.adjustCourseObj.classroom_id,
							term_id: JSON.parse(sessionStorage.currTerm).id
						}

						let that = this
						that.adjustCourseInfoData.conflictScheduleObj = ''
						that.adjustCourseInfoData.sq_arrangementMsg = ''
						that.adjustCourseInfoData.bt_arrangementMsg = ''
						that.axios.post(that.interfaceUrl + 'TKScheduleOverview/checkeConflictSchedule', that.qs(data))
							.then(
								function(res) {
									console.log(res.data)
									if (res.data.state) {
										if (res.data.conflictSchedule) {
											let section = []
											res.data.conflictSchedule.forEach((item) => {
												section.push(item.section)
											})
											that.adjustCourseInfoData.conflictScheduleObj = res.data.conflictSchedule[0]
											that.adjustCourseInfoData.conflictScheduleObj.section = section
											that.adjustCourseInfoData.conflictScheduleObj.weekName = that.weeklys.find((
													item) =>
												item.weekNum == that
												.adjustCourseInfoData.conflictScheduleObj.weekly).weekName
											that.adjustCourseInfoData.bt_arrangementMsg = res.data.bt_arrangementMsg
											that.conflict = true;
										}
										if(res.data.sq_arrangementMsg){
											that.adjustCourseInfoData.sq_arrangementMsg = res.data.sq_arrangementMsg
											that.conflict = true
											that.btnDisabled = true
										}
									} else {
										that.messageError(res.data.msg);
									}
								})
							.catch(function() {
								that.messageError('服务器错误');
							});
					} else {
						this.conflict = true;
						let conflictScheduleObj = params.row[params.column.key]
						conflictScheduleObj.weekName = this.weeklys.find((item) => item
							.weekNum == params.row[
								params.column.key].weekly).weekName
						let toWeekly = this.weeklys.find(
							(item) => item.weekNum == this.search.teacherWeekly
						);
						let toWeek = this.weeks.find((item) => item.str == params
							.column.title)
						conflictScheduleObj.weekName = toWeekly.weekName;
						conflictScheduleObj.weekCode = toWeek.code; // 星期
						conflictScheduleObj.weekNum = toWeekly.weekNum; //周次

						let info =
							`${conflictScheduleObj.courseName},${conflictScheduleObj.teacherName},${conflictScheduleObj.className},${conflictScheduleObj.teacherClassName}`;
						let sectionArr = this.isMerge(params, info, conflictScheduleObj.section)
						conflictScheduleObj.section = sectionArr
						this.adjustCourseInfoData.conflictScheduleObj =
							conflictScheduleObj
					}
				}
			},

			// 移除按钮的事件
			removeCourse(obj, params) {
				this.$Modal.confirm({
					closable: true,
					title: "提示",
					content: "确定移除该课程安排吗？",
					onOk: () => {
						/**
						 *删除课表数据
						 *
						 * @param scheduleId 需删除的课表数据的Id
						 *
						 * @return 是否成功
						 * TKScheduleOverview/deleteSchedule
						 */
						let info =
							`${obj.courseName},${obj.teacherName},${obj.className},${obj.teacherClassName}`;
						let sectionArr = this.isMerge(params, info, obj.section)
						let data = {
							scheduleId: obj.id,
							section: sectionArr.toString()
						}
						let that = this
						that.axios.post(that.interfaceUrl + 'TKScheduleOverview/deleteSchedule', that.qs(data))
							.then(
								function(res) {
									console.log(res.data)
									if (res.data.state) {
										that.$Message.success(res.data.msg);
										that.getSchedule();
									} else {
										that.messageError(res.data.msg);
									}
								})
							.catch(function() {
								that.messageError('服务器错误');
							});
					},
				});
			},

			// 调课操作信息中的取消事件
			removeAdjustCourseTo() {
				this.again = true;
				this.btnDisabled = true;
				this.conflict = false
				this.adjustTo = 0;
				this.adjustCourseInfoData.adjustCourseObj = "";
				this.adjustCourseInfoData.adjustCourseToObj = "";
				this.adjustCourseInfoData.conflictScheduleObj = "";
				this.adjustCourseInfoData.sq_arrangementMsg = ''
				this.adjustCourseInfoData.bt_arrangementMsg = ''
				this.getSchedule();
			},

			// 调课操作信息中的确认事件
			sendAdjustCourseInfo() {
				this.again = true;
				this.btnDisabled = true;
				this.conflict = false
				this.adjustTo = 0
				let adjustCourseObj = this.adjustCourseInfoData.adjustCourseObj;
				let adjustCourseToObj = this.adjustCourseInfoData.adjustCourseToObj;
				let conflictScheduleObj = this.adjustCourseInfoData.conflictScheduleObj
				let to_weekly = []
				if (this.isSync) {
					this.weeklys.forEach((item) => {
						if (item.weekNum >= adjustCourseToObj.weekNum) to_weekly.push(item.weekNum)
					})
				}

				let data = {
					scheduleId: adjustCourseObj.id, //课表Id 新增则无，调课有
					term_id: JSON.parse(sessionStorage.currTerm).id,
					course_id: adjustCourseObj.course_id,
					course_name: adjustCourseObj.courseName, //课程
					teaching_teacher_id: adjustCourseObj.teaching_teacher_id,
					teaching_teacher_name: adjustCourseObj.teacherName,
					teaching_class: adjustCourseObj.teacherClassName,
					teaching_class_id: adjustCourseObj.teaching_class_id,
					to_classroom_id: adjustCourseObj.classroom_id,
					to_weekly: to_weekly.length != 0 ? to_weekly : adjustCourseToObj.weekNum,
					to_section: adjustCourseToObj.sectionID,
					to_week: adjustCourseToObj.weekCode,
					schedule_conflict_id: conflictScheduleObj ? conflictScheduleObj.id : '',
					tkType: "T01", //临时调课T01 新增T02  影响后续的永久调课T03
				};
				this.loading = true
				this.classesInOperation(data);
				this.adjustCourseInfoData.adjustCourseObj = "";
				this.adjustCourseInfoData.adjustCourseToObj = "";
				this.adjustCourseInfoData.conflictScheduleObj = "";
				this.adjustCourseInfoData.sq_arrangementMsg = ''
				this.adjustCourseInfoData.bt_arrangementMsg = ''
			},

			// 判断所选节次是否连续
			sectionIsContinuous(section) {
				let i = section[0]
				let isContinuous = true
				section.forEach((e) => {
					if (e != i) return isContinuous = false;
					i++
				})
				return isContinuous
			},

			// 调课操作信息中的表单确认事件
			sendAdjustToForm() {
				let adjustCourseData = this.adjustCourseData
				if (adjustCourseData.classNameId && adjustCourseData.classroomId && adjustCourseData.courseId &&
					adjustCourseData.week && adjustCourseData.section.length != 0 && adjustCourseData.weekly.length != 0) {
					adjustCourseData.teachName = this.search.teacher;
					adjustCourseData.section.sort((a, b) => a - b)
					adjustCourseData.weekly.sort((a, b) => a - b)
					let isContinuous = this.sectionIsContinuous(adjustCourseData.section)

					let course_name = this.courseList.find(
						(item) => item.id == adjustCourseData.courseId
					).courseName;

					let teaching_teacher_name = this.teacherList.find(
						(item) => item.id == this.search.teacherId
					).xm;
					let teaching_class = this.classNames.find(
						(item) => item.id == adjustCourseData.classNameId
					).teachingClassName;

					let data = {
						scheduleId: "", //课表Id 新增则无，调课有
						term_id: JSON.parse(sessionStorage.currTerm).id,
						course_id: adjustCourseData.courseId,
						course_name: course_name, //课程
						teaching_teacher_id: this.search.teacherId,
						teaching_teacher_name: teaching_teacher_name,
						teaching_class: teaching_class,
						teaching_class_id: adjustCourseData.classNameId,
						to_classroom_id: adjustCourseData.classroomId,
						to_weekly: adjustCourseData.weekly.toString(),
						to_section: adjustCourseData.section.toString(),
						to_week: adjustCourseData.week,
						tkType: "T02", //临时调课T01 新增T02  影响后续的永久调课T03
						addWay: "teacher"
					};

					if (isContinuous) {
						this.loading = true
						this.classesInOperation(data);
					} else {
						this.$Message.warning('所选节次需要连续，请重新选择');
					}
				} else {
					this.$Modal.warning({
						title: '提示',
						content: "提交的表单不完整，请填充完整"
					});
				}
			},
			// 新增或调课
			classesInOperation(data) {
				console.log(data)
				/**
				 * 课表概览新增或调课
				 * TKScheduleOverview/classesInOperation
				 * 
				 * @param scheduleId 课表Id 新增则无，调课有
				 * @param to_weekly 调至周次 1,2,3 
				 * @param to_week 调至星期
				 * @param to_section 调至节次 5,6
				 * @param to_classroom_id 调至教室
				 * @param teaching_class 教学班
				 * @param teaching_class_id 教学班
				 * @param teaching_teacher_id 调课教师ID
				 * @param teaching_teacher_name 调课教师名称
				 * @param schedule_conflict_id 冲突ID
				 * @param course_name 课程
				 * @param course_id 课程ID
				 * @param term_id 学期
				 * @param tkType 调课T01 新增T02 
				 * @param addWay 参数为 （classroom | teacher） 对应教师课表操作 和 教师课表操作
				 *
				 * @return 单条数据
				 */
				let that = this
				that.axios.post(that.interfaceUrl + 'TKScheduleOverview/classesInOperation', that.qs(data)).then(
						function(res) {
							console.log(res.data)
							if (res.data.state) {
								that.getSchedule();
								that.adjustTo = 0;
								that.$Message.success(res.data.msg)
							} else {
								that.$Modal.warning({
									title: '提示',
									content: res.data.msg
								});
							}
							that.loading = false
						})
					.catch(function() {
						that.messageError('服务器错误');
					});
			},

			// 切换按钮
			changeBtn(index) {
				this.activeIndex = index;
				// 0：教室课表，1：教师课表；2：班级周课表
				switch (index) {
					case 0:
						console.log("教室课表");
						this.getBuilding();
						this.getClassName()
						this.getSchedule();
						break;
					case 1:
						console.log("教师课表");
						this.getBuilding();
						this.getTeacher()
						this.getSchedule();
						break;
					case 2:
						console.log("班级周课表");
						this.getClassName()
						this.getSchedule();
						break;
				}
			},

			// 行、列合并
			handleSpan({
				row,
				column,
				rowIndex,
				columnIndex
			}) {
				if (this.activeIndex == 0) {
					 if (row["week1"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 1);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week1"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week1"][column.key].mergeNum == 0
                    ? 0
                    : row["week1"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week2"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 2);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week2"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week2"][column.key].mergeNum == 0
                    ? 0
                    : row["week2"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week3"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 3);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week3"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week3"][column.key].mergeNum == 0
                    ? 0
                    : row["week3"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week4"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 4);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week4"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week4"][column.key].mergeNum == 0
                    ? 0
                    : row["week4"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week5"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 5);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week5"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week5"][column.key].mergeNum == 0
                    ? 0
                    : row["week5"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week6"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 6);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week6"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week6"][column.key].mergeNum == 0
                    ? 0
                    : row["week6"][column.key].mergeNum;
                return [x, y];
              }
            }
        }
        if (row["week0"]) {
          let index = this.sortClassroomWeek.findIndex((item) => item == 0);
            let colIndex = index * this.allSection.length + column.key * 1;
            if (!Object.is(colIndex, NaN)) {
              if (columnIndex == colIndex) {
                let x = row["week0"][column.key].mergeNum == 0 ? 0 : 1;
                let y =
                  row["week0"][column.key].mergeNum == 0
                    ? 0
                    : row["week0"][column.key].mergeNum;
                return [x, y];
              }
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
          // 遍历每一行
          console.log({
            classroom,
            i,
          });
          this.search.classroomWeek.forEach((weekNum) => {
            // 遍历所勾选的星期
            let cWeek = classroom[`week${weekNum}`]; // 当前星期存在的课程
            let str = null;
            let index = null;
            if (cWeek) {
              for (let section of Object.keys(cWeek)) { //遍历当前星期的节次
                cWeek[section].mergeNum = 1;
                // 判断是否为第一个有课的节次
                if (
                  cWeek[section].id &&
                  (cWeek[section * 1 - 1] == undefined ||
                    !cWeek[section * 1 - 1].id)
                ) {
                  // 判断当前节次的下一节次是否存在课程
                  if (
                    cWeek[section * 1 + 1] != undefined &&
                    cWeek[section * 1 + 1].id
                  ) {
                    console.log(section);
                    if (!str && !index) {
                      str = cWeek[section].sectionStr;
                      index = section;
                      continue;
                    }
                  }
                } else if (cWeek[section].id) {
                  if (cWeek[section].sectionStr == str) {
                    cWeek[index].outset = index;
                    cWeek[index].mergeNum++;
                    cWeek[section].mergeNum = 0;
                  } else {
                    str = cWeek[section].sectionStr;;
                    index = section;
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
				if (this.activeIndex == 0) {
					this.getClassroom();
					this.getSchedule()
				}
				if (this.activeIndex == 1) {
					this.getClassName()
					this.getCourse();
					this.getSchedule()
				}
				if (this.activeIndex == 2) {
					this.getClassName()
					this.getSchedule()
				}
			},

			// 获取节次信息
			getSection() {
				let that = this
				this.axios.post(that.interfaceUrl + 'classtime/getArrClassTimeByPage', that.qs({
					pageNum: 1,
					pageSize: 999,
					termId: JSON.parse(sessionStorage.currTerm).id
				})).then(resp => {
					console.log(resp)
					if (resp.data.state) {
						that.allSection = resp.data.arrClassTime;
						that.getSchedule();
					} else {
						that.messageError(resp.data.msg);
					}
				})
			},

			// 获取课程安排信息
			getSchedule() {
				let that = this
				this.loading = true
				if (this.activeIndex == 0) {
					// 教室课表
					this.classroomScheduleData = [];
					let classroomListCopy = this.deepClone(this.classroomList);
					let data = {
						buildingId: this.search.buildingId,
						weekNum: this.search.classroomWeekly,
						termId: JSON.parse(sessionStorage.currTerm).id
					}

					that.axios.post(that.interfaceUrl + 'TKScheduleOverview/selectScheduleOverviewClassRoom', that.qs(
							data)).then(
							function(res) {
								if (res.data.state) {
									console.log(res.data.tksList)
									that.classroomScheduleItems = res.data.tksList ? res.data.tksList : []
									that.formatTeacthscheduleData(
										that.classroomScheduleItems,
										classroomListCopy,
										that.allSection
									);
									that.classroomScheduleData = that.assembleData(classroomListCopy);
									that.setWeekClassroomSchedule()
									that.loading = false
								} else {
									that.messageError(res.data.message);
								}
							})
						.catch(function() {
							that.messageError('服务器错误');
						});
				} else if (this.activeIndex == 1) {
					// 教师课表
					this.teacherScheduleData = [];
					// 刷新节次信息
					let allSection = this.deepClone(this.allSection);

					let data = {
						teacherId: this.search.teacherId,
						weekNum: this.search.teacherWeekly,
						termId: JSON.parse(sessionStorage.currTerm).id,
					}

					that.axios.post(that.interfaceUrl + 'TKScheduleOverview/selectScheduleOverviewClassRoom', that.qs(
							data)).then(
							function(res) {
								if (res.data.state) {
									console.log(res.data.tksList)
									that.teacherScheduleItems = res.data.tksList ? res.data.tksList : [],
										that.formatscheduleData(that.teacherScheduleItems, allSection);
									that.teacherScheduleData = that.assembleData(allSection);
									that.loading = false
								} else {
									that.messageError(res.data.message);
								}
							})
						.catch(function() {
							that.messageError('服务器错误');
						});
				} else if (this.activeIndex == 2) {
					this.classScheduleData = [];
					// 刷新节次信息
					let allSection = this.deepClone(this.allSection);
					let data = {
						teachingClassId: this.search.classNameId,
						weekNum: this.search.weekly,
						termId: JSON.parse(sessionStorage.currTerm).id,
					}

					that.axios.post(that.interfaceUrl + 'TKScheduleOverview/selectScheduleOverviewClassRoom', that.qs(
							data)).then(
							function(res) {
								if (res.data.state) {
									console.log(res.data.tksList)
									that.classScheduleItems = res.data.tksList ? res.data.tksList : [],
										that.formatscheduleData(that.classScheduleItems, allSection);
									that.classScheduleData = that.assembleData(allSection);
									that.loading = false
								} else {
									that.messageError(res.data.message);
								}
							})
						.catch(function() {
							that.messageError('服务器错误');
						});
				}
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
						if (item.week === w) {
							let info =
								`${item.course},${item.teachName},${item.classroom},${item.className}`;
							classroomListCopy.forEach((e) => {
								if (item.classroom_id == e.id) {
									switch (w) {
										case 1:
											e.week1 ? "" : (e.week1 = this.deepClone(sectionObj));
											e.week1[item.section] = item;

											e.week1[item.section]["sectionStr"] = info;
											break;
										case 2:
											e.week2 ? "" : (e.week2 = this.deepClone(sectionObj));
											e.week2[item.section] = item;

											e.week2[item.section]["sectionStr"] = info;
											break;
										case 3:
											e.week3 ? "" : (e.week3 = this.deepClone(sectionObj));
											e.week3[item.section] = item;

											e.week3[item.section]["sectionStr"] = info;
											break;
										case 4:
											e.week4 ? "" : (e.week4 = this.deepClone(sectionObj));
											e.week4[item.section] = item;

											e.week4[item.section]["sectionStr"] = info;
											break;
										case 5:
											e.week5 ? "" : (e.week5 = this.deepClone(sectionObj));
											e.week5[item.section] = item;

											e.week5[item.section]["sectionStr"] = info;
											break;
										case 6:
											e.week6 ? "" : (e.week6 = this.deepClone(sectionObj));
											e.week6[item.section] = item;

											e.week6[item.section]["sectionStr"] = info;
											break;
										case 7:
											e.week7 ? "" : (e.week7 = this.deepClone(sectionObj));
											e.week7[item.section] = item;

											e.week7[item.section]["sectionStr"] = info;
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
				console.log(scheduleItems, allSection)
				allSection.forEach((sectionItem) => {
					scheduleItems.forEach((scheduleItem) => {
						if (sectionItem.code == scheduleItem.section) {
							// info 用于判断是否应该合并
							let info =
								`${scheduleItem.courseName},${scheduleItem.teacherName},${scheduleItem.className},${scheduleItem.teacherClassName}`;

							switch (scheduleItem.week) {
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
								case 7:
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
				this.axios
					.post(
						that.interfaceUrl + "week/selectAllByPage",
						that.qs({
							pageNum: 1,
							pageSize: 999,
							termId: JSON.parse(sessionStorage.currTerm).id,
						})
					)
					.then((resp) => {
						console.log(resp);
						if (resp.data.state) {
							that.weeklys = resp.data.weekList;
							that.compareDate(that.curTime, resp.data.weekList);
							that.getSchedule()
						} else {
							that.messageError(resp.data.msg);
						}
					});
			},

			// 获取课程
			getCourse() {
				// this.courseList =
				let that = this;
				that.axios
					.post(
						that.interfaceUrl + "courseSet/queryByTeacherId",
						that.qs({
							termId: JSON.parse(sessionStorage.currTerm).id,
							teacherId: that.search.teacherId ? that.search.teacherId : ''
						})
					)
					.then(function(res) {
						console.log(res.data);
						if (res.data.state) {
							that.courseList = res.data.currTeaCourses;
							that.adjustCourseData.courseId = res.data.currTeaCourses[0].id
						} else {
							that.messageError(res.data.msg);
						}
					});
			},

			// 获取教学班级
			getClassName() {
				let that = this;
				// this.classNames =
				let teacherId = this.activeIndex == 1 ? that.search.teacherId : ''
				that.axios
					.post(
						that.interfaceUrl + "tkTeachingClass/selectAllByPage",
						that.qs({
							pageNum: 1,
							pageSize: 999,
							teachingTeacherId: teacherId,
							termId: JSON.parse(sessionStorage.currTerm).id
						})
					)
					.then(function(res) {
						console.log(res.data);
						if (res.data.state) {
							if (res.data.TeachingClassList) {
								that.classNames = res.data.TeachingClassList;
								if (that.activeIndex == 1) {
									that.adjustCourseData.classNameId = res.data.TeachingClassList[0].id
								} else {
									that.search.classNameId = res.data.TeachingClassList[0].id
								}
							} else {
								that.classNames = []
								if (that.activeIndex == 1) {
									that.adjustCourseData.classNameId = ''
								}
							}
						} else {
							that.messageError(res.data.msg);
						}
					});
			},

			// 获取老师
			getTeacher() {
				let that = this;
				that.axios
					.post(
						that.interfaceUrl + "teacher/selectAllByPage",
						that.qs({
							pageNum: 1,
							pageSize: 999,
							termId: JSON.parse(sessionStorage.currTerm).id
						})
					)
					.then(function(res) {
						console.log(res.data);
						if (res.data.state) {
							that.teacherList = res.data.teacherList;
							if (that.search.teacherId == '') {
								that.search.teacherId = res.data.teacherList[0].id
							}
							that.getClassName()
						} else {
							that.messageError(res.data.msg);
						}
					});
			},

			// 获取楼栋信息
			getBuilding() {
				let that = this;
				that.axios.post(that.interfaceUrl + 'teachingBuilding/selectAll').then(function(res) {
					console.log(res.data)
					if (res.data.state) {
						if (res.data.buildings) {
							that.buildings = res.data.buildings
							that.search.buildingId = res.data.buildings[0].id
							that.getClassroom()
						}
					} else {
						that.messageError(res.data.msg);
					}
				});
			},

			// 获取教室信息
			getClassroom() {
				let that = this;
				that.axios.post(that.interfaceUrl + '/classroom/selectAllByPage', that.qs({
					pageNum: 1,
					pageSize: 999,
					buildingId: that.search.buildingId,
					termId: JSON.parse(sessionStorage.currTerm).id
				})).then(function(res) {
					console.log(res.data)
					if (res.data.state) {
						that.classroomList = res.data.classroomList
						if (that.activeIndex == 0) {
							that.getSchedule();
						}
						if (that.adjustCourseData.classroomId == '' || that.activeIndex == 1) {
							that.adjustCourseData.classroomId = res.data.classroomList[0].id
						}
					} else {
						that.messageError(res.data.msg);
					}
				})
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
							Object.prototype.toString.call(origin[prop]) == "[object Array]" ? [] : {};
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
				if (w == 0) w = 7
				// 为教室课表的 星期多选框 赋值
				this.search.classroomWeek = [w];

				switch (w) {
					case 7:
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
							this.curWeekly = item.weekNum
							this.search.classroomWeekly = item.weekNum;
							this.search.teacherWeekly = item.weekNum;
							this.search.weekly = item.weekNum;
						}
					});
					this.cutOutWeekly = []
					weeklys.forEach((weekly) => {
						if (weekly.weekNum >= this.curWeekly) {
							this.cutOutWeekly.push(weekly)
						}
					})
				}
			},

			// 将连续的周次合并
			formatWeekly(weekly) {
				let weeklyArr = weekly.split(',')
				let ranges = [],
					rstart, rend;
				for (let i = 0; i < weeklyArr.length; i++) {
					rstart = weeklyArr[i];
					rend = rstart;
					while (weeklyArr[i + 1] - weeklyArr[i] == 1) {
						rend = weeklyArr[i + 1];
						i++;
					}
					ranges.push(rstart == rend ? rstart + '' : rstart + '-' + rend);
				}
				return ranges;
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
						return "星期日";
				}
			},
		},
		computed: {
			getCurTime() {
				let time = new Date().getTime();
				this.curTime = this.formatDate(time);
				this.curTime = "2021-04-01 星期二"
				return this.curTime;
			},
			// 返回调课操作信息的数据格式化
			formatAdjustCourseInfoData() {
				return (data) => {
					if (data.teacherName) {
						return `${data.teacherName} > ${data.weekName} > ${data.week} > 第${data.sectionID}节 > ${data.courseName} > ${data.teacherClassName} > ${data.className}`;
					} else if (data.msg) {
						return `${data.msg}`;
					}
					return "";
				};
			},
		},
		mounted() {
			this.curTerm = JSON.parse(sessionStorage.currTerm)
			this.getTeacher();
			this.getClassName();
			this.getWeekly();
			this.getBuilding();
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

	.classScheduleOverview .teacherScheduleBox .content {
		padding: 0;
	}

	.classScheduleOverview .teacherScheduleBox {
		display: flex;
	}

	.classScheduleOverview .teacherScheduleBox .searchZone {
		background-color: #55a1ff;
		height: 48px;
		color: #fff;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse {
		width: 300px;
		/* height: 506px; */
		background-color: #fff;
		margin-left: 32px;
		box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
		/* 不自动收缩 */
		flex-shrink: 0;
		position: relative;
	}

	.classScheduleOverview .adjustCourse .title {
		background-color: #ff9d76;
		width: 100%;
		height: 48px;
		text-align: center;
		line-height: 48px;
		color: #fff;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .ivu-form-item {
		margin-bottom: 16px;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustTo {
		width: 100%;
		height: 22px;
		position: relative;
		margin: 30px 0;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .liner {
		width: 100%;
		height: 1px;
		background-color: #ff4900;
		position: relative;
		top: 50%;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .littleTitle {
		text-align: center;
		width: 70px;
		height: 22px;
		line-height: 22px;
		margin: 0 auto;
		background-color: #fff;
		position: relative;
		z-index: 3;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo .info {
		width: 100%;
		overflow-y: auto;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo .isConflict {
		text-align: center;
		color: #ff4900;
		margin: 40px 0 30px;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo .isConflict i {
		font-size: 24px;
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
		text-align: center;
		margin-top: 50px;
		width: 100%;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToDefault {
		text-align: center;
		margin-top: 160px;
	}

	.classScheduleOverview .teacherScheduleBox .adjustCourse .adjustToInfo .ivu-checkbox-inner {
		width: 14px;
		height: 14px;
		border: 1px solid #ff4900;
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
