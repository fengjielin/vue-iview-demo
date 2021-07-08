<template>
	<div class="content">
		<div class="notice_search_area" style="display: flex; justify-content: flex-end">
			<!-- 搜索与新增区域 -->
			<Form :model="searchData" :label-width="100" inline style="flex: 1">
				<FormItem label="教学班：">
					<Input @on-change="searchTeachingClass" :search="true" type="text"
						v-model="searchData.teachingClassName" class="wd200" placeholder="输入教学班名称查询"
						size="small"></Input>
				</FormItem>
				<FormItem label="授课老师：">
					<Input @on-change="searchTeachingClass" :search="true" type="text" v-model="searchData.teacher"
						class="wd200" placeholder="输入授课老师名称查询" size="small"></Input>
				</FormItem>
				<FormItem label="所授课程：">
					<Input @on-change="searchTeachingClass" :search="true" type="text" v-model="searchData.course"
						class="wd200" placeholder="输入课程名称查询" size="small"></Input>
				</FormItem>
				<Button size="small" @click="show" type="primary"
					style="position: absolute; right: 20px;">新建教学班</Button>
			</Form>
		</div>
		<!-- 表格 -->
		<Table :loading="loading" :columns="columns" :data="tableData" border stripe style="margin-top: 10px" />
		<!-- 分页 -->
		<Page @on-change="changePage" :total="page.totalNum" :current="page.pageNum" :page-size="page.pageSize"
			show-elevator show-total class="page" />

		<!-- 关联行政班的弹出框 -->
		<Modal v-model="showAdmModal" title="关联行政班" width="600px" :closable="true" :mask-closable="false"
			@on-cancel="showAdmModalClose">
			<div class="modal">
				<Form :model="data" :rules="ruleValidate" ref="teachingClassComp" :label-width="100">
					<FormItem label="行政班名称：">
						<Input :search="true" type="text" style="width: 200px;"
							placeholder="输入行政班名称查询"></Input>
					</FormItem>
				</Form>
			</div>
			<!-- 未关联行政班表格 -->
			<Table ref="class_selection" size="small" :loading="loading" border :columns="classColumns"
				:data="unSelectedClass" @on-selection-change="mutiSelect"
				style="margin-top: 10px; margin-bottom: 10px;"></Table>
			<!-- 已关联行政班表格 -->
			<Table ref="class_selection" size="small" :loading="loading" border :columns="selectedClassColumns"
				:data="selectedClass" @on-selection-change="mutiSelect"></Table>

			<div slot="footer" style="text-align: center">
				<Button @click="showAdmModalClose">取消</Button>
				<Button type="primary" @click="relevance">关联</Button>
			</div>
		</Modal>


		<!-- 修改的弹出框 -->
		<Modal v-model="showUpdeteModal" :title="title" width="600px" :closable="true" :mask-closable="false"
			@on-cancel="updeteModalClose">
			<div class="modal">
				<Form :model="data" :rules="ruleValidate" ref="teachingClassComp" :label-width="110">
					
					<FormItem label="教学班名称：" prop="className">
						<Input type="text" v-model="data.className" placeholder="请输入教学班名称" class="formInput"
							maxlength="30"></Input>
					</FormItem>
					<FormItem label="授课老师：" prop="className">
						<Input type="text" v-model="data.teacher" placeholder="请输入授课老师" class="formInput"
							maxlength="30"></Input>
					</FormItem>
					<FormItem label="所授课程：" prop="className">
						<Input type="text" v-model="data.course" placeholder="请输入所授课程" class="formInput"
							maxlength="30"></Input>
					</FormItem>
					<FormItem label="班级人数：" prop="className">
						<Input type="text" v-model="data.stuNumber" placeholder="请输入班级人数" class="formInput"
							maxlength="30"></Input>
					</FormItem>
				</Form>
			</div>
			<div slot="footer" style="text-align: center">
				<Button @click="updeteModalClose">取消</Button>
				<Button type="primary" @click="ok">保存</Button>
			</div>
		</Modal>

	</div>
</template>

<script>
	// 临时数据
	import teachingClassJson from '../json/class.json'
	import admClass from '../json/admClass.json'

	export default {
		data() {
			return {
				// 校验规则
				ruleValidate: {
					classNum: [{
							required: true,
							message: "教学班编号不能为空",
							trigger: "blur"
						},
						{
							type: "string",
							pattern: "[^\\s+]",
							message: "不能输入空格字符串",
							trigger: "blur",
						},
					],
					className: [{
							required: true,
							message: "教学班名称不能为空",
							trigger: "blur"
						},
						{
							type: "string",
							pattern: "[^\\s+]",
							message: "不能输入空格字符串",
							trigger: "blur",
						},
					],
				},
				// 专业列表
				zhuanYeList: [],
				xzclassList: [],

				selectClassStudents: [],
				selectStudents: [],
				students: [],
				// 已关联的行政班
				selectedClass: [],
				// 未关联的行政班
				unSelectedClass: [],
				allClassStudents: [],

				curTeacher: {
					teacherId: "",
					xm: "",
				},
				// 搜索框绑定的数据
				searchData: {
					teachingClassName: "",
					teacher: "",
					course: ""
				},

				loading: false,
				showModal: false,
				showUpdeteModal: false,
				showAdmModal: false,
				title: "",
				// 教学班表格的数据数组
				tableData: [],
				selectClass: [],
				data: {
					id: "",
					classNum: "",
					className: "",
				},

				page: {
					totalNum: 0,
					pageNum: 1,
					pageSize: 10,
				},
				// 行政班表格数据
				classColumns: [{
						type: 'selection',
						width: 60,
						align: 'center'
					},
					{
						title: '行政班名称',
						key: 'teachingClassName',
						align: 'center'
					},
					{
						title: '班级人数',
						key: 'stuNumber',
						align: 'center'
					},
				],
				// 已关联行政班表格数据
				selectedClassColumns: [{}, {}, {}],
				// 表格的数据
				columns: [{
						title: "教学班名称",
						key: "teachingClassName",
						align: "center",
					},
					{
						title: "授课老师",
						key: "teacher",
						align: "center",
					},
					{
						title: "所授课程",
						key: "course",
						align: "center",
					},
					{
						title: "班级人数",
						key: "stuNumber",
						align: "center",
					},
					{
						title: "操作",
						key: "action",
						align: "center",
						width: 300,
						render: (h, params) => {
							return h("span", [
								h(
									"a", {
										props: {
											type: "primary",
											size: "small",
										},
										style: {
											marginRight: "22px",
										},
										on: {
											click: () => {
												this.showAdm(params.row);
											},
										},
									},
									"关联行政班"
								),
								h(
									"a", {
										props: {
											type: "success",
											size: "small",
										},
										style: {
											marginRight: "22px",
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
									"a", {
										props: {
											type: "error",
											size: "small",
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
			};
		},

		mounted() {
			this.getTeachingClass();
			// this.getzhuanye();
		},
		methods: {
			mutiSelect(sel) {
				this.selectClass = sel;
			},

			// 点击搜索
			searchTeachingClass() {
				this.page.pageNum = 1;
				this.getTeachingClass();
			},

			// 获取教学班的数据
			getTeachingClass() {
				let that = this;
				console.log(teachingClassJson)
				that.tableData = teachingClassJson;

				// that.loading = true;
				// that.axios
				//   .post(
				//     that.interfaceUrl + "teachingClass/selectAllByPage.do",
				//     that.qs({
				//       pageNum: that.page.pageNum,
				//       pageSize: that.page.pageSize,
				//       classNum: that.searchData.classNum,
				//     })
				//   )
				//   .then(function (res) {
				//     if (res.data.state) {
				//       that.page.totalNum = res.data.dataCount;
				//       that.tableData = res.data.TeachingClass;
				//       that.loading = false;
				//     } else {
				//       that.messageError(res.data.msg);
				//     }
				//   });
			},
			changePage(i) {
				this.page.pageNum = i;
				this.getTeachingClass();
			},

			// 关联行政班按钮的点击事件
			showAdm(row) {
				this.showAdmModal = true;
				this.unSelectedClass = admClass;
				console.log(this.data)
			},

			// 点击新增按钮和修改按钮
			show(row) {
				if (row.id) {
					console.log(row)
					this.title = "修改教学班";
					this.data.id = row.id;
					this.data.classNum = row.teachingClassNum;
					this.data.className = row.teachingClassName;
					this.data.course = row.course;
					this.data.teacher = row.teacher;
					this.data.stuNumber = row.stuNumber;
				} else {
					this.title = "新增教学班";
					this.data.id = "";
					this.data.classNum = "";
					this.data.className = "";
					this.data.course = "";
					this.data.teacher = "";
					this.data.stuNumber = "";
					this.$nextTick(function() {
						this.data.teacherId = "";
					});
					this.data.courseId = "";
					this.curTeacher.xm = "";
				}
				this.showUpdeteModal = true;
			},
			relevance() {
				console.log("关联行政班")
				this.showAdmModal = false;
			},
			ok() {
				let that = this;
				let flag = true;
				this.$refs["teachingClassComp"].validate((valid) => {
					if (!valid) {
						this.$Modal.error({
							title: "提示",
							content: "表单填写有误",
							closable: true,
						});
						flag = false;
					}
				});
				if (!flag) {
					return;
				}
				let data = {
					id: that.data.id == null ? "" : that.data.id,
					classNum: that.data.classNum,
					className: that.data.className,
				};
				that.axios
					.post(
						that.interfaceUrl + "teachingClass/dealTeachingClass.do",
						that.qs(data)
					)
					.then(function(res) {
						if (res.data.state) {
							that.$Message.success("保存成功");
							that.showModal = false;
							that.getTeachingClass();
						} else {
							that.messageError(res.data.message);
						}
					})
					.catch(function() {
						that.messageError("服务器错误");
					});
			},

			modalClose() {
				this.showModal = false;
			},
			updeteModalClose() {
				this.showUpdeteModal = false;
			},
			showAdmModalClose() {
				this.showAdmModal = false;
			},

			// 删除按钮的点击事件
			remove(row) {
				let that = this;
				that.$Modal.confirm({
					closable: true,
					title: "提示",
					content: "确定删除 " + row.teachingClassName + " 吗？",
					onOk: function() {
						that.axios
							.post(
								that.interfaceUrl + "teachingClass/deleteTeachingClass.do",
								that.qs({
									id: row.id,
								})
							)
							.then(function(res) {
								if (res.data.state) {
									that.$Message.success("删除成功");
									that.page.pageNum = 1;
									that.getTeachingClass();
								} else {
									that.$Message.error(res.data.msg);
								}
							})
							.catch(function(e) {
								that.messageError("服务器错误" + e);
							});
					},
				});
			},
			formatDate(timeStamp) {
				let time = new Date(timeStamp),
					y = time.getFullYear(),
					m = time.getMonth() + 1,
					d = time.getDate(),
					h = time.getHours(),
					mm = time.getMinutes(),
					s = time.getSeconds();
				return (
					y +
					"-" +
					this.add0(m) +
					"-" +
					this.add0(d) +
					" " +
					this.add0(h) +
					":" +
					this.add0(mm) +
					":" +
					this.add0(s)
				);
			},
			add0(m) {
				return m < 10 ? "0" + m : m;
			},
		},
	};
</script>

<style scoped>
	.content {
		width: 100%;
		padding: 20px;
	}

	.modal {
		padding-left: 0px;
	}

	.formInput {
		width: 240px;
	}

	.page {
		float: right;
		margin-right: 17px;
		margin-top: 3px;
	}

</style>
