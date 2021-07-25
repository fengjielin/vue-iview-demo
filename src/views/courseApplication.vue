<template>
	<div class="courseTransferReview">
		<ButtonGroup style="left: 50%; transform: translateX(-50%);">
			<Button v-for="(item, index) in btn" :key="index" :type="activeIndex == index ? 'primary' : 'default'"
				@click="changeBtn(index)">{{ item }}</Button>
		</ButtonGroup>

		<div class="content">
			<!-- 表格区域 -->
			<div>
				<Table border :columns="courseTransferColumns" :data="courseTransferTable"></Table>
				<!-- 分页 -->
				<Page @on-change="changePage" :total="page.totalNum" :current="page.pageNum" :page-size="page.pageSize"
					show-elevator show-total class="page" />
			</div>
		</div>

		<!-- 详情的弹窗 -->
		<Modal v-model="detailsModal" title="调课申请详情" @on-cancel="detailsCancel" :mask-closable=false :closable=true>
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
				<!-- <Button type="primary" @click="pass(curCourseTransferRow)" v-if="activeIndex == 0">通过</Button> -->
			</div>
		</Modal>

		<!-- 通过与退回的弹窗 -->
		<Modal v-model="showModal" :title="title" @on-cancel="showModalCancel" :mask-closable=false :closable=true>
			<Input v-model="data.review" type="textarea" placeholder="Enter something..." />
			<div slot="footer" style="text-align: center">
				<Button @click="showModalCancel">取消</Button>
				<Button type="primary" @click="ok">保存</Button>
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
						title: "周次",
						align: "center",
						key: "weekly",
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
						key: "teachingClass",
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
						key: "changeCourseType",
						className: "applicationTypeStyle",
						render: (h, params) => {
							// 根据条件判断内容重写
							switch (params.row.changeCourseType) {
								case "T01":
									return h("span", "调至");
								case "T02":
									return h("span", "新增");
							}
						},
					},
					{
						title: "周次",
						key: "toWeekly",
						align: "center",
						minWidth: 102,
					},
					{
						title: "星期",
						key: "toWeek",
						align: "center",
						minWidth: 102,
					},
					{
						title: "节次",
						key: "toSection",
						align: "center",
						minWidth: 102,
					},
					{
						title: "课室",
						key: "toClassroom",
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
										"Button", {
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
										"Button", {
											props: {
												type: "primary",
												size: "small",
											},
											style: {
												marginRight: "15px",
											},
											on: {
												click: () => {
													this.showPass(params.row);
												},
											},
										},
										"通过"
									),
									h(
										"Button", {
											props: {
												type: "primary",
												size: "small",
											},
											on: {
												click: () => {
													this.showSendBack(params.row);
												},
											},
										},
										"退回"
									),
								]);
							} else {
								return h("div", [
									h(
										"Button", {
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
									)
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
				// 控制通过与退回弹窗的显示与隐藏
				showModal: false,

				title: '',
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

				
				data: {
					// 审核通过或退回需要的回执
					review: '',
				},
				// 当前用户数据
				userinfo:{},

				// 模拟数据
				courseTransferTable2: [{
						id: 1,
						status: 0, //审核状态
						teachingTeacher: '于老师', //授课老师
            teachingTeacherId:24,
						teachingClass: "软件工程1班", //班级名称
						courseName: "软件工程", //课程名称
						weekly: "第一周", //周次
						week: "星期一", //星期
						section: "第1、2节", //节次
						classroom: "信息楼201", //课室

						changeCourseType: "T01", //申请类型
            shStatus:'S01',

						toTeachingTeacher: '张老师', //授课老师
            toTeachingTeacherId: 4,
						toWeekly: "第一周", //周次
						toWeek: "星期二", //星期
						toSection: "第1、2节", //节次
						toClassroom: "信息楼202", //课室
					},
          {
						id: 2,
						status: 0, //审核状态
						teachingTeacher: '于老师', //授课老师
            teachingTeacherId:24,
						teachingClass: "软件工程1班", //班级名称
						courseName: "软件工程", //课程名称
						weekly: "第一周", //周次
						week: "星期一", //星期
						section: "第1、2节", //节次
						classroom: "信息楼201", //课室

						changeCourseType: "T01", //申请类型
            shStatus:'S01',

						toTeachingTeacher: '张老师', //授课老师
            toTeachingTeacherId: 4,
						toWeekly: "第一周", //周次
						toWeek: "星期二", //星期
						toSection: "第1、2节", //节次
						toClassroom: "信息楼202", //课室
					},
          {
						id: 1,
						status: 0, //审核状态
						teachingTeacher: '于老师', //授课老师
            teachingTeacherId:24,
						teachingClass: "软件工程1班", //班级名称
						courseName: "软件工程", //课程名称
						weekly: "第一周", //周次
						week: "星期一", //星期
						section: "第1、2节", //节次
						classroom: "信息楼201", //课室

						changeCourseType: "T02", //申请类型
            shStatus:'S01',

						// toTeachingTeacher: '张老师', //授课老师
            // toTeachingTeacherId: 4,
						// toWeekly: "第一周", //周次
						// toWeek: "星期二", //星期
						// toSection: "第1、2节", //节次
						// toClassroom: "信息楼202", //课室
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
				let that = this
				this.courseTransferTable = this.courseTransferTable2;

				// 后端五个接口？
				//把不同的数据保存在不同的变量中，当点击切换btn时，赋值对应的变量给courseTransferTable

				// 当点击通过，将需要审核通过的申请的id发给后端进行处理，然后前端重新去获取数据
				// 当点击退回，将需要退回的的申请的id发给后端进行处理，然后前端再去重新获取数据
        
        // 详情信息有一个接口，不知里面数据是什么

				// 1待审核 2审核通过 3退回
				// 请求后端 
				let data = {
					pageNum: this.page.pageNum,
					pageSize: this.page.pageSize,
				}
				// that.axios.post(that.interfaceUrl + '/CourseProcessTransaction/selectAllByPage', that.qs(data)).then(
				// 	function(res) {
				// 		console.log(res)
				// 		if (res.data.state) {
				// 			that.page.totalNum = res.data.count
				// 			that.courseTransferTable = res.data.arrCourseTimeCondition
				// 			// that.changeBtn(0)
				// 		} else {
				// 			that.messageError(res.data.msg);
				// 		}
				// 	}).catch(function() {
				// 	that.messageError('服务器错误');
				// });
			},

			// 切换btn
			changeBtn(index) {
				this.activeIndex = index;
				// 0：待审核，1：审核通过；2：退回

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
				this.curCourseTransferRow = row

				this.detailsList.teaching_teacher = row.teachingTeacher
				this.detailsList.teaching_class = row.teachingClass;
				this.detailsList.course_name = row.courseName;
				this.detailsList.weekly = row.weekly;
				this.detailsList.week = row.week;
				this.detailsList.section = row.section;
				this.detailsList.classroom = row.classroom;

				if (row.changeCourseType == 'T01') {
					this.detailsToList.change_type = '调用';
				} else {
					this.detailsToList.change_type = '新增';
				}

				this.detailsToList.to_teaching_teacher = row.toTeachingTeacher
				this.detailsToList.to_teaching_class = row.teachingClass;
				this.detailsToList.to_course_name = row.courseName;
				this.detailsToList.to_weekly = row.toWeekly;
				this.detailsToList.to_week = row.toWeek;
				this.detailsToList.to_section = row.toSection;
				this.detailsToList.to_classroom = row.toClassroom;

				this.detailsModal = true;
			},
			// 关闭详情弹窗
			detailsCancel() {
				this.detailsModal = false;
			},

			// 打开通过弹窗
			showPass(row) {
        this.data.review = ''
				this.showModal = true;
				this.title = '审核通过'
				this.data.id = row.id
				this.data.passesOrNot = 'S01'
				this.data.processHierarchy = row.curHierarchy
			},

			showModalCancel() {
				this.showModal = false;
			},

			// 打开退回的弹窗
			showSendBack(row) {
        this.data.review = ''
				this.showModal = true;
				this.title = '审核退回'
        this.data.id = row.id
				this.data.passesOrNot = 'S02'
				this.data.processHierarchy = row.curHierarchy
			},

			// 审核通过和退出的确定按钮
			ok() {
				let data = {
					processType: 'T01',
					pId: this.data.id,
					// operatorId: this.userinfo.id,
					operatorId: '',
					review: this.data.review,
					passesOrNot: this.data.passesOrNot,
					processHierarchy: this.data.processHierarchy
				}
				console.log(data)
        //that.axios.post(that.interfaceUrl + '/CourseProcessTransaction/passesOrNot', that.qs(data)).then(
				// 	function(res) {
				// 		console.log(res)
				// 		if (res.data.state) {
        //      this.getCourseTransferData();
				// 		} else {
				// 			that.messageError(res.data.msg);
				// 		}
				// 	}).catch(function() {
				// 	that.messageError('服务器错误');
				// });
        this.showModalCancel()
			}
		},
		mounted() {
			this.getCourseTransferData();
			console.log(this.courseTransferTable);
      
			// let state = JSON.parse(sessionStorage.state);
			// this.userinfo = state.token;
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
		padding-top: 32px;
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
