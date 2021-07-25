<template>
	<div style="padding:20px">
		<Tabs value="name1">
			<TabPane label="教师课程表" name="name1">
				<div style="text-align:left">
					<Select filterable :label-in-value="true" placeholder="请选择学期" style="width: 200px">
						<Option v-for="item in terms" :value="item.id" @click.native="getIndex(item)" :key="item.value">
							{{item.termName}}</Option>
					</Select>
					<Select v-model="week" filterable placeholder="请选择周次" style="width: 200px">
						<Option v-for="item in weeks" :value="item.weekNum" :key="item.value">{{item.weekName}}</Option>
					</Select>
					<Select v-model="teaName" filterable placeholder="请选择教师" style="width: 200px">
						<Option v-for="item in teachers" :value="item.xm" @click.native="getTeacher(item)"
							:key="item.value">{{item.xm}}</Option>
					</Select>
					<Button type="primary" @click="search">搜索</Button>
					<Button type="primary" @click="openFile()">导入课程表</Button>
				</div>
				<div class="teaTitle" v-if='teaflag'>{{term.termName}}{{teaName}}第{{week+1}}周课程表</div>
				<Table :loading="loading" border :data="tableData2" :columns="tableColumns1" style="margin-top:5px;">
				</Table>
			</TabPane>
			<Modal v-model="modal1" title="导入" @on-ok="ok" class="modal1">
				<div id="top">
					<Upload ref="upload" :action="actionUrl" :on-success="handleSuccess">
						<Button type="ghost" icon="ios-cloud-upload-outline">上传文件</Button>
					</Upload>
				</div>
				<div slot="footer">
					<Button type="info" @click='okFile' :loading="modalloading">确认</Button>
				</div>
			</Modal>
			<!-- <TabPane label="班级课程表" name="name2" style="height:600px">
					    	<div style="text-align:left">
					    				<Select filterable placeholder="请选择学期" style="width: 200px">
							                <Option v-for="item in terms" :value="item.id" @click.native = "getIndex(item)" :key="item.value">{{item.termName}}</Option>
							            </Select>
							             <Select v-model="week" filterable placeholder="请选择周次" style="width: 200px">
							                <Option v-for="item in weeks" :value="item.weekNum" :key="item.value">{{item.weekName}}</Option>
							            </Select>
								 		<Select v-model="className" filterable placeholder="请选择班级" style="width: 200px">
							                <Option v-for="item in banjis" :value="item.bjmc" :key="item.value">{{item.bjmc}}</Option>
							            </Select>
										<Button type="primary"  @click="searchClass">搜索</Button>
							</div>
							<div class="teaTitle" v-if='classflag'>{{term.termName}}{{className}}第{{week+1}}周课程表</div>
							 <Table :loading="loading" border  :data="tableData3" :columns="tableColumns1"  style="margin-top:5px;"></Table>
			</TabPane> -->
			<Modal v-model="showModal" :title="title" width="380px" :closable=true :mask-closable=false
				@on-cancel="modalClose">
				<div class="modal" v-if="tkModal">
					<!-- <Button type="primary" size="large" @click="delCourseShow()">取 消 此 课</Button> -->
					<Button type="primary" size="large" @click="updateCourseTimeModalShow()">调换此节课时间段</Button>
					<Button type="primary" size="large" @click="updateCourseModalShow()">更改此时段课程安排</Button>
				</div>
				<div class="modal" v-if="updateCourseTimeModal">
					<Form :model="data" :rules="ruleValidate" ref="courseTableComp" :label-width="120">
						<!-- <FormItem label="教学班名称：" prop="teachingClassName">
							<Select v-model="data.teachingClassName" style="width:200px">
								<Option v-for="item in teachingClass" @click.native="setTeachingClass(item)" :value="item.teachingClassName" :key="item.teachingClassName">{{ item.teachingClassName }}</Option>
							</Select>
							<Button type="primary" icon="ios-search" style="margin-bottom: 5px;" @click="showTeachingClassStudents">查看学生</Button>
						</FormItem>-->
						<FormItem label="当前周：">
							<span>第{{week+1}}周</span>
						</FormItem>
						<FormItem label="当前星期：">
							<span>{{currWeekDayName}}</span>
						</FormItem>
						<FormItem label="当前节数：">
							<span>{{currKnodName}}</span>
						</FormItem>
						<FormItem label="调至：">
							<i-select v-model="updateWeek" style="width:200px">
								<i-option v-for="item in weeks" :value="item.weekNum" :key="item.value">
									{{item.weekName}}</i-option>
							</i-select>
							<i-select v-model="data.weekDay" style="width:200px">
								<i-option value="0">周一</i-option>
								<i-option value="1">周二</i-option>
								<i-option value="2">周三</i-option>
								<i-option value="3">周四</i-option>
								<i-option value="4">周五</i-option>
								<i-option value="5">周六</i-option>
								<i-option value="6">周天</i-option>
							</i-select>
							<i-select v-model="data.knod" style="width:200px">
								<i-option v-for="item in pitchs" :value="item.code" :key="item.code">{{item.name}}
								</i-option>
							</i-select>
						</FormItem>
					</Form>

				</div>
				<div class="modal" v-if="updateCourseModal">
					<Form :model="data" :rules="ruleValidate" ref="courseTableComp" :label-width="120">
						<!-- <FormItem label="教学班名称：" prop="teachingClassName">
							<Select v-model="data.teachingClassName" style="width:200px">
								<Option v-for="item in teachingClass" @click.native="setTeachingClass(item)" :value="item.teachingClassName" :key="item.teachingClassName">{{ item.teachingClassName }}</Option>
							</Select>
							<Button type="primary" icon="ios-search" style="margin-bottom: 5px;" @click="showTeachingClassStudents">查看学生</Button>
						</FormItem>-->
						<FormItem label="选择行政班：">
							<i-select v-model="currentBanjis" multiple style="width:200px">
								<i-option v-for="item in banJis" :value="item.bjmc">{{ item.bjmc }}</i-option>
							</i-select>
						</FormItem>
						<FormItem label="课程名称：">
							<Input type="text" v-model="data.courseName" placeholder="请输入课程名称" style="100px"
								maxLength=30></Input>
						</FormItem>
						<FormItem label="场室名称：">
							<Input type="text" v-model="data.classRoom" placeholder="请输入场室名称" style="100px"
								maxLength=20></Input>
						</FormItem>
					</Form>
				</div>
				<div slot="footer" style="text-align: center;">
					<Button @click="modalClose">取消</Button>
					<Button type="primary" @click="ok">保存</Button>
				</div>
			</Modal>
			<Modal v-model="classStudentModal.view" :title="classStudentModal.title"
				@on-cancel="classStudentModalCancel()" width="800" :mask-closable="false">
				<Form @submit.native.prevent :model="classStudentModal" :label-width="50" inline>
					<FormItem label="姓名：">
						<Input @on-change="searchClassStudent" :search="true" type="text" v-model="classStudentModal.xm"
							style="width: 200px;" placeholder="输入姓名查询"></Input>
					</FormItem>
				</Form>
				<Table :columns="classStudentColumns" :data="classStudents"></Table>
				<Page :total="classStudentModal.pageTotal" :current="classStudentModal.pageNum"
					:page-size="classStudentModal.pageSize" show-elevator show-total
					@on-change="choseClassStudentChange" align="right" style="margin-top:10px;margin-right: 20px;">
				</Page>
				<div slot="footer" style="text-align: center;">
				</div>
			</Modal>
		</Tabs>
	</div>
</template>

<style>
	.teaTitle {
		text-align: center;
		font-family: "arial, helvetica, sans-serif";
		font-size: 20px;
		margin: 20px;
	}
</style>
<script>
	export default {
		created() {
			//  		this.getWeeks();
			this.getTeachers();
			this.getAllBanjis();
			this.getTerms();
			this.getPitch();
			this.userInfo = this.$store.state.userInfo
		},
		data() {
			return {
				classflag: false,
				actionUrl: this.interfaceUrl + "import/filesUpload.do",
				teaflag: false,
				showModal: false,
				courseTeas: [],
				banJis: [],
				currentBanjis: [],
				teachingClass: [],
				weeks: [],
				terms: [],
				term: "",
				teachers: [],
				teaName: "",
				teacher: {},
				className: "",
				week: "",
				userInfo: {},
				loading: false,
				tableData2: [],
				tableData3: [],
				currKnodName: "",
				tkType: "",
				ruleValidate: {
					teachingClassId: [{
						required: true,
						message: '请选择教学班',
						trigger: 'blur',
						type: 'number'
					}, ]
				},
				pitchs: [],
				tableColumns1: [{
						title: '节数',
						key: 'codeName',
						align: 'center',
					},
					{
						title: '周一',
						key: 'week1',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "0", params.row.week1);
						}
					},
					{
						title: '周二',
						key: 'week2',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "1", params.row.week2);
						}
					},
					{
						title: '周三',
						key: 'week3',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "2", params.row.week3);
						}
					},
					{
						title: '周四',
						key: 'week4',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "3", params.row.week4);
						}
					},
					{
						title: '周五',
						key: 'week5',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "4", params.row.week5);
						}
					},
					{
						title: '周六',
						key: 'week6',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "5", params.row.week6);
						}
					},
					{
						title: '周日',
						key: 'week7',
						align: 'center',
						render: (h, params) => {
							return this.getColumns(h, params, "6", params.row.week7);
						}
					}
				],
				title: "",
				updateCourseTimeModal: false,
				updateCourseModal: false,
				currWeekDayName: "",
				tkModal: false,
				updateWeek: "",
				data: {
					courseClassId: '',
					teaName: "",
					teaNum: "",
					teachingClassId: "",
					teachingClassName: "",
					teachingClass: null,
					courseName: "",
					classRoom: "",
					knod: "",
					week: "",
					weekDay: "",
				},
				classStudentModal: {
					title: "班级学生",
					view: false,
					pageNum: 1,
					pageSize: 10,
					pageTotal: 0,
					xm: ""
				},
				classStudentColumns: [{
						title: '学生姓名',
						key: 'studentName',
						align: 'center'
					},
					{
						title: '行政班名称',
						key: 'bjmc',
						align: 'center'
					}
				],
				classStudents: [],
				modal1: false,
				modalloading: false,
				importValue: [],
				fileList: [],
			}
		},
		methods: {
			show(row, num, index) {
				this.getAllBanjis();
				//拼接周，判断是否有课程
				let courseClassValue = []
				let courseName = ""
				switch (num) {
					case '0':
						this.data.courseClassId = row.coursetableClassId1[index]
						this.currWeekDayName = "周一"
						if (row.week1) {
							courseClassValue = row.week1[index].split("\n");
						}
						break;
					case '1':
						this.data.courseClassId = row.coursetableClassId2[index]
						this.currWeekDayName = "周二"
						if (row.week2) {
							courseClassValue = row.week2[index].split("\n");
						}
						break;
					case '2':
						this.data.courseClassId = row.coursetableClassId3[index]
						this.currWeekDayName = "周三"
						if (row.week3) {
							courseClassValue = row.week3[index].split("\n");
						}
						break;
					case '3':
						this.data.courseClassId = row.coursetableClassId4[index]
						this.currWeekDayName = "周四"
						if (row.week4) {
							courseClassValue = row.week4[index].split("\n");
						}
						break;
					case '4':
						this.data.courseClassId = row.coursetableClassId5[index]
						this.currWeekDayName = "周五"
						if (row.week5) {
							courseClassValue = row.week5[index].split("\n");
						}
						break;
					case '5':
						this.data.courseClassId = row.coursetableClassId6[index]
						this.currWeekDayName = "周六"
						if (row.week6) {
							courseClassValue = row.week6[index].split("\n");
						}
						break;
					case '6':
						this.data.courseClassId = row.coursetableClassId7[index]
						this.currWeekDayName = "周天"
						if (row.week7) {
							courseClassValue = row.week7[index].split("\n");
						}
				}
				this.currKnodName = row.codeName;
				console.log(this.week);
				console.log(num);
				console.log(courseClassValue);
				console.log(this.data.courseClassId);
				if (courseClassValue[0]) {
					this.currentBanjis = courseClassValue[0].split(",");
				}
				console.log(this.currentBanjis)
				if (courseClassValue[1]) {
					this.data.courseName = courseClassValue[1];
				}
				if (courseClassValue[2]) {
					this.data.classRoom = courseClassValue[2].replace("(", "").replace(")", "");
				}
				console.log(courseClassValue[1])
				console.log(this.data.courseClassId)
				if (this.data.courseClassId) {
					this.title = '调课'

				} else {
					this.title = '新增课程表信息'
				}
				this.data.weekDay = num;
				this.data.week = this.week;
				this.data.knod = row.knod;
				this.data.teaNum = this.teacher.gh
				this.data.teaName = this.teacher.xm
				this.showModal = true
				this.tkModal = true
				console.log(this.data);
			},
			//获取节次
			getPitch() {
				let that = this;
				this.axios.post(that.interfaceUrl + 'manageRule/getClassTime.do').then(resp => {
					if (resp.data.state) {
						that.pitchs = resp.data.timeList;
					} else {
						that.messageError(resp.data.msg);
					}
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});
			},
			remove(row, num, index) {
				switch (num) {
					case '0':
						this.data.courseClassId = row.coursetableClassId1[index]
						break;
					case '1':
						this.data.courseClassId = row.coursetableClassId2[index]
						break;
					case '2':
						this.data.courseClassId = row.coursetableClassId3[index]
						break;
					case '3':
						this.data.courseClassId = row.coursetableClassId4[index]
						break;
					case '4':
						this.data.courseClassId = row.coursetableClassId5[index]
						break;
					case '5':
						this.data.courseClassId = row.coursetableClassId6[index]
						break;
					case '6':
						this.data.courseClassId = row.coursetableClassId7[index]
				}
				let that = this
				that.$Modal.confirm({
					closable: true,
					title: '提示',
					content: '确定取消此课程安排吗？',
					onOk: function() {
						var params = new URLSearchParams();
						params.append('coursetableClassId', that.data.courseClassId);
						that.axios.post(that.interfaceUrl + 'courseMaintain/delCourseClassById.do', params)
							.then(resp => {
								if (resp.data.state) {
									that.$Message.success("取消成功");
									that.search()
								}
							}).catch(function(e) {
								that.messageError('服务器错误' + e);
							});
					}
				});
			},
			openFile() {
				if (this.term.id == null || this.term.id.length < 1) {
					this.$Message.warning("请选择学期")
					that.modalloading = false;
					return
				}
				this.modal1 = true;
			},
			handleSuccess(res, file, fileList) {
				this.fileList = fileList
				this.$Message.success("上传成功");
			},
			okFile() {
				if (this.fileList == null || this.fileList.length < 1) {
					this.$Message.warning("请上传文件")
					return
				}
				this.importValue = JSON.stringify(this.importValue);
				this.modalloading = true;
				this.importData();
			},
			importData() {
				var that = this;
				var params = new URLSearchParams();
				if (this.term.id == null || this.term.id.length < 1) {
					this.$Message.warning("请选择学期")
					that.modalloading = false;
					return
				}
				params.append('termId', this.term.id);
				params.append('termName', this.term.termName);
				this.axios.post(this.interfaceUrl + 'import/filesImport2.do', params).then(resp => {
					that.modalloading = false;
					if (resp.data.state) {
						that.modal1 = false;
						that.$Message.success(resp.data.msg);
					} else {
						that.modal1 = false;
						that.$Message.error(resp.data.msg);
					}
				});
			},
			setTeachingClass(item) {
				this.data.teachingClass = item;
			},
			ok(row, num) {
				if (this.tkType == "updateCourseTime") {
					this.updateTimeOk()
					return;
				}
				let flag = true;
				this.$refs["courseTableComp"].validate(valid => {
					if (!valid) {
						this.$Modal.error({
							title: '提示',
							content: '表单填写有误',
							closable: true
						});
						flag = false;
					}
				});
				if (!flag) {
					return;
				}
				// console.log("---------");
				// console.log(this.data.teaNum);
				// console.log(this.data.teaName);
				// console.log(this.data.teachingClassName);
				// console.log(this.data.courseName);
				// console.log(this.data.classRoom);
				// console.log(this.data.week);
				// console.log(this.data.weekDay);
				// console.log(this.data.knod);//节数
				// console.log(this.term.id);
				// console.log(this.term.termName);
				// console.log(this.data.courseClassId);
				this.dealCourseTablesMaintain();
			},
			dealCourseTablesMaintain() {
				let that = this
				var params = new URLSearchParams();
				console.log(that.tkType);
				params.append('tkType', that.tkType);
				params.append('teaNum', that.data.teaNum);
				params.append('teaName', that.data.teaName);
				params.append('className', that.currentBanjis);
				params.append('courseName', that.data.courseName);
				params.append('classRoom', that.data.classRoom);
				params.append('week', that.tkType == "updateCourseTime" ? that.updateWeek : that.data.week);
				params.append('weekDay', that.data.weekDay);
				params.append('knod', that.data.knod); //节数
				params.append('termId', that.term.id);
				params.append('termName', that.term.termName);
				params.append('coursetableClassId', that.data.courseClassId);
				that.axios.post(that.interfaceUrl + 'courseMaintain/dealCourseTablesMaintain.do', params).then(resp => {
					if (resp.data.state) {
						that.modalClose()
						that.$Message.success("调课成功！")
						that.search()
					}
				});
			},
			updateTimeOk() {
				let that = this
				var params = new URLSearchParams();
				params.append('teaName', that.data.teaName);
				params.append('className', that.currentBanjis);
				params.append('week', that.updateWeek);
				params.append('weekDay', that.data.weekDay);
				params.append('knod', that.data.knod); //节数
				params.append('termId', that.term.id);
				that.axios.post(that.interfaceUrl + 'courseMaintain/checkUpdateCourseOk.do', params).then(resp => {
					if (resp.data.warringState) {
						that.$Modal.confirm({
							closable: true,
							title: '提示',
							content: resp.data.warrningMsg,
							onOk: function() {
								that.dealCourseTablesMaintain();
							}
						});
					} else {
						that.$Modal.confirm({
							closable: true,
							title: '提示',
							content: "选择时段无课程安排,是否调课？",
							onOk: function() {
								that.dealCourseTablesMaintain();
							}
						});
					}
				});
			},
			modalClose() {
				this.showModal = false;
				this.updateCourseTimeModal = false;
				this.updateCourseModal = false;
				this.data = {
					courseClassId: '',
					teaName: "",
					teaNum: "",
					teachingClassId: "",
					teachingClassName: "",
					teachingClass: null,
					courseName: "",
					classRoom: "",
					knod: "",
					week: "",
					weekDay: ""
				};
				this.classStudents = null;
				this.classStudentModal.pageTotal = 0;
			},
			getColumns(h, params, num, curWeek) {
				let temp = [];
				if (curWeek) {
					if (curWeek.length > 1) {
						for (let i = 0; i < curWeek.length; i++) {
							let test1 =
								h('div',
									[
										curWeek ?
										h('Dropdown', {
											props: {
												transfer: true
											}
										}, [
											h('div', {
												style: {
													cursor: 'pointer',
													margin: '5px',
													background: '#FFAC38',
													padding: '5px',
													'border-radius': '10px',
													color: '#2D8CF0',
												},
											}, "课表存在冲突！" + curWeek[i]),
											h('DropdownMenu', {
												slot: 'list'
											}, [
												h('DropdownItem', {
													nativeOn: {
														click: (name) => {
															this.show(params.row, num, i)
														}
													}
												}, '调课功能'),
												h('DropdownItem', {
													nativeOn: {
														click: (name) => {
															this.remove(params.row, num, i)
														}
													}
												}, '取消课程')
											])
										]) :
										h('Dropdown', {
											props: {
												transfer: true
											}
										}, [])
									])
							temp.push(test1);
						}
					} else if (curWeek.length == 1) {
						temp = h('Dropdown', {
							props: {
								transfer: true
							}
						}, [
							h('div', {
								style: {
									cursor: 'pointer',
									margin: '5px',
									background: '#F8F8F9',
									padding: '5px',
									'border-radius': '10px',
									color: '#2D8CF0',
								}
							}, curWeek),
							h('DropdownMenu', {
								slot: 'list'
							}, [
								h('DropdownItem', {
									nativeOn: {
										click: (name) => {
											this.show(params.row, num, 0)
										}
									}
								}, '调课功能'),
								h('DropdownItem', {
									nativeOn: {
										click: (name) => {
											this.remove(params.row, num, 0)
										}
									}
								}, '取消课程')
							])
						]);
					}
				} else {
					temp = h('Dropdown', {
						props: {
							transfer: true
						}
					}, [
						h('div', {
							style: {
								fontSize: '24px', // 改变icon的样式
								color: '#559DF9',
								cursor: 'pointer'
							}
						}, "--"),
						// h('DropdownMenu', {
						// 	slot: 'list'
						// }, [
						// 	h('DropdownItem', {
						// 		nativeOn: {
						// 			click: (name) => {
						// 				this.show(params.row, num,)
						// 			}
						// 		}
						// 	}, '添加'),
						// ])
					]);
				}
				return temp;
			},
			getIndex(item) {
				this.term = item;
				this.getWeeks();
			},
			search() {
				if (this.teaName == "" || this.week === "") return
				this.loadding = false;
				let teaName = this.teaName;
				let week = this.week;
				this.searchCourseTea(teaName, week);
			},
			searchClass() {
				this.classflag = true;
				this.loadding = false;
				let week = this.week;
				let className = this.className;
				this.searchCourseClass(className, week);
			},
			searchCourseTea(teaName, week) {
				this.teaflag = true;
				var that = this;
				var params = new URLSearchParams();
				params.append('termId', this.term.id);
				params.append('teaName', teaName);
				params.append('week', week);
				this.axios.post(that.interfaceUrl + 'course/searchCourseTea.do', params).then(resp => {
					let tableData = []
					resp.data.coursedata.forEach(function(o) {
						if (o.codeName != "早读" && o.codeName != "晚修") {
							tableData.push(o)
						}
					})
					that.tableData2 = tableData;
				}); //去除早读、晚修的课
			},
			searchCourseClass(className, week) {
				var that = this;
				var params = new URLSearchParams();
				params.append('termId', this.term.id);
				params.append('className', className);
				params.append('week', week);
				this.axios.post(that.interfaceUrl + 'course/searchCourseClass.do', params).then(resp => {
					that.tableData3 = resp.data.coursedata;
				});
			},
			getWeeks() {
				var that = this;
				var params = new URLSearchParams();
				params.append('termId', this.term.id);
				this.axios.post(that.interfaceUrl + 'course/getWeek.do', params).then(resp => {
					that.weeks = resp.data.weeks;
				});
			},
			getTeachers(zyid, njid) {
				var that = this;
				that.axios.post(that.interfaceUrl + 'course/getTeachers.do').then(resp => {
					that.teachers = resp.data.teachers;
				});
			},
			getTeacher(item) {
				var that = this;
				var params = new URLSearchParams();
				params.append('pageNum', 1);
				params.append('pageSize', 10);
				params.append('xm', item.xm);
				that.axios.post(that.baseUrl + 'teacher/selectAllByPage', params).then(resp => {
					if (resp.data.dataCount > 0) {
						resp.data.teacherList
						that.teacher = resp.data.teacherList[0];
					}
					that.teaName = that.teacher.xm
					that.search();
				});

			},
			updateCourseTimeModalShow() {
				this.tkModal = false;
				this.updateCourseTimeModal = true;
				this.tkType = "updateCourseTime"

			},
			updateCourseModalShow() {
				this.tkModal = false;
				this.updateCourseModal = true;
				this.tkType = "updateCourse"
			},
			// getAllBanjis(){
			// 	var that = this;
			// 	var params = new URLSearchParams();
			// 	params.append('pageSize',9999);
			// 	this.axios.post(that.interfaceUrl+'teachingClass/selectAllByPage.do',params).then(resp => {
			// 		that.teachingClass = resp.data.TeachingClass;
			// 	});
			// },
			//
			getAllBanjis() {
				var that = this;
				var params = new URLSearchParams();
				params.append('pageSize', 9999);
				this.axios.post(that.baseUrl + '/getBanJis', params).then(resp => {
					that.banJis = resp.data.banJis;
				});
			},
			getTerms() {
				var that = this;
				this.axios.post(that.interfaceUrl + 'common/getTerm.do').then(resp => {
					that.terms = resp.data.terms;
				});
			},
			showTeachingClassStudents() {
				this.classStudentModal.view = true;
				if (this.data.teachingClass == null) {
					if (this.data.teachingClassName) {
						this.getClassByName();
					}
				} else {
					console.log(this.data.teachingClass.id)
					this.getClassStudents();
				}
			},
			getClassByName() {
				let that = this;
				that.axios.post(that.interfaceUrl + 'teachingClass/getClassByName.do', that.qs({
					className: that.data.teachingClassName
				})).then(function(res) {
					if (res.data.state) {
						that.data.teachingClass = res.data.teachingClass;
						console.log(that.data.teachingClass)
						that.getClassStudents();
					} else {
						that.messageError(res.data.msg);
					}
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});
			},
			getClassStudents() {
				let that = this;
				that.axios.post(that.interfaceUrl + 'teachingClass/queryTeachingStudentClass.do', that.qs({
					pageNum: that.classStudentModal.pageNum,
					pageSize: that.classStudentModal.pageSize,
					studentName: that.classStudentModal.xm,
					classId: that.data.teachingClass.id,
				})).then(function(res) {
					if (res.data.state) {
						that.classStudentModal.pageTotal = res.data.dataCount;
						that.classStudents = res.data.teachingStudentClassList;
					} else {
						that.messageError(res.data.msg);
					}
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});
			},
			classStudentModalCancel() {
				this.classStudentModal.view = false;
			},
			searchClassStudent() {
				this.classStudentModal.pageNum = 1;
				this.getClassStudents();
			},
			choseClassStudentChange(i) {
				this.classStudentModal.pageNum = i;
				this.getClassStudents();
			},
		}
	}
</script>
