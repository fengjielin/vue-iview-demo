<template>
  <div class="content">
    <div
      class="notice_search_area"
      style="display: flex; justify-content: flex-end"
    >
      <!-- 搜索与新增区域 -->
      <Form :model="searchData" :label-width="100" inline style="flex: 1">
        <FormItem label="教学班：">
          <Input
            @on-change="searchTeachingClass"
            :search="true"
            type="text"
            v-model="searchData.teachingClassName"
            class="wd200"
            placeholder="输入教学班名称查询"
            size="small"
            maxlength="20"
          ></Input>
        </FormItem>
        <!-- feng -->
        <FormItem label="授课老师：">
          <!-- <Input @on-change="searchTeachingClass" :search="true" type="text" v-model="searchData.teachingTeacherId"
						class="wd200" placeholder="输入授课老师名称查询" size="small" maxlength="20"></Input> -->
            <Select v-model="searchData.teachingTeacherId"  style="width: 200px" :filterable="true" @on-change="searchTeachingClass">
              <!-- <Option v-for="item in teacherList" :value="item.id" :key="item.id" >{{ item.xm }}</Option > -->
              <Option  value= 1 >张</Option >
              <Option  value= 2 >李</Option >
            </Select>
        </FormItem>
        <FormItem label="所授课程：">
          <!-- <Input @on-change="searchTeachingClass" :search="true" type="text" v-model="searchData.courseId"
						class="wd200" placeholder="输入课程名称查询" size="small" maxlength="20"></Input> -->
            <Select v-model="searchData.courseId"  style="width: 200px" :filterable="true" @on-change="searchTeachingClass">
              <!-- <Option v-for="item in AdminTeachingClassList" :value="item.id" :key="item.id" >{{ item.courseName }}</Option > -->
              <Option  value= 1 >课程1</Option >
              <Option  value= 2 >课程2</Option >
            </Select>
        </FormItem>

        <Button
          size="small"
          @click="show"
          type="primary"
          style="position: absolute; right: 20px"
          >新建教学班</Button
        >
      </Form>
    </div>

    <!-- 表格 -->
    <Table
      :loading="loading"
      :columns="columns"
      :data="tableData"
      border
      stripe
      style="margin-top: 10px"
    />

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

    <!-- 关联行政班的弹出框 -->
    <Modal
      v-model="showAdmModal"
      title="关联行政班"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="showAdmModalClose"
    >
      <div class="modal">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="teachingClassComp"
          :label-width="100"
        >
          <FormItem label="行政班名称：">
            <Input
              @on-change="handleRelevance"
              :search="true"
              type="text"
              style="width: 200px"
              placeholder="输入行政班名称查询"
              maxlength="20"
            ></Input>
            <Button @click="handleRelevance" style="margin-left:10px">关联</Button>
          </FormItem>
        </Form>
      </div>
      <!-- 未关联行政班表格 -->
      <Table
        ref="class_selection"
        size="small"
        :loading="loading"
        border
        :columns="classColumns"
        :data="unSelectedClass"
        @on-selection-change="mutiSelect"
        @on-row-click="rowClick"
        style="margin-top: 10px; margin-bottom: 10px"
      ></Table>
      <!-- 已关联行政班表格 -->
      <Table
        size="small"
        :loading="loading"
        border
        :columns="selectedClassColumns"
        :data="selectedClass"
        @on-selection-change="mutiSelect"
      ></Table>

      <div slot="footer" style="text-align: center">
        <Button @click="showAdmModalClose">取消</Button>
        <Button type="primary" @click="relevance">保存</Button>
      </div>
    </Modal>

    <!-- 修改的弹出框 -->
    <Modal
      v-model="showUpdeteModal"
      :title="title"
      width="600px"
      :closable="true"
      :mask-closable="false"
      @on-cancel="updeteModalClose"
    >
      <div class="modal">
        <Form
          :model="data"
          :rules="ruleValidate"
          ref="teachingClassComp"
          :label-width="110"
        >
          <FormItem label="教学班名称：" prop="className">
            <Input
              type="text"
              v-model="data.className"
              placeholder="请输入教学班名称"
              class="formInput"
              maxlength="20"
            ></Input>
          </FormItem>
          <FormItem label="授课老师：" prop="teacher">
            <Select
              v-model="data.teacher"
              style="width: 200px"
              :filterable="true"
            >
              <Option
                v-for="item in teacherList"
                :value="item.id"
                :key="item.id"
                >{{ item.xm }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="所授课程：" prop="courseName">
            <Row>
              <Col span="13">
                <Select v-model="data.courseName" placeholder="请选择所授课程">
                  <Option
                    v-for="item in AdminTeachingClassList"
                    :value="item.id"
                    :key="item.id"
                    >{{ item.courseName }}</Option
                  >
                </Select>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="班级人数：" prop="classroomPeopleNum">
            <InputNumber
              :max="100"
              :min="1"
              v-model="data.classroomPeopleNum"
            ></InputNumber>
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

import axios from 'axios'

	export default {
		data() {
			return {
				// 校验规则
				ruleValidate: {
					teacher: [{
						required: true,
						message: "授课老师不能为空",
						trigger: "blur"
					}],
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
					courseName: [{
						required: true,
						message: "所授课程不能为空",
						type: 'number',
						trigger: "blur"
					}],
					classroomPeopleNum: [{
						required: true,
						message: "班级人数不能为空",
						type: 'number',
						trigger: "blur"
					}],
				},
				// 新增与修改表单绑定的数据
				data: {
					className: "",
					teacher: "",
					courseName: "",
					classroomPeopleNum: 0
				},

        // 授课老师的数据
				teacherList: [],
        // 全部行政班的数据
				AdminTeachingClassList:[],
        
        // 当前点击关联行政班的教学班id
				curSelTeachingClassId: 0,
        // 以选择关联的行政班的id集合 
        adminClassId:[],

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
				// 未关联表格中已选中的数据
				selectClass: [],

				allClassStudents: [],
				curTeacher: {
					teacherId: "",
					xm: "",
				},
				// 搜索框绑定的数据
				searchData: {
					teachingClassName: "",//教学班名
					teachingTeacherId: "",//教师id
					courseId: ""//课程id
				},

				loading: false,
				showModal: false,
				showUpdeteModal: false,
				showAdmModal: false,
				title: "",
				// 教学班表格的数据数组
				tableData: [],

				page: {
					totalNum: 0,
					pageNum: 1,
					pageSize: 10,
				},
				// 未关联行政班表格数据
				classColumns: [{
						type: 'selection',
						width: 60,
						align: 'center'
					},
					{
						title: '行政班名称',
						key: 'bjmc',
						align: 'center'
					},
					{
						title: '班级人数',
						key: 'bjrs',
						align: 'center'
					},
				],
				// 已关联行政班表格数据
				selectedClassColumns: [{
						type: 'index',
						width: 60,
						align: 'center'
					},
					{
						title: '行政班名称',
						key: 'bjmc',
						align: 'center'
					},
					{
						title: '班级人数',
						key: 'bjrs',
						align: 'center'
					},
				],

				// 表格的数据
				columns: [{
						title: "教学班名称",
						key: "teachingClassName",
						align: "center",
					},
					{
						title: "授课老师",
						key: "teacherName",
						align: "center",
					},
					{
						title: "所授课程",
						key: "courseName",
						align: "center",
					},
					{
						title: "班级人数",
						key: "classroomPeopleNum",
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
			// this.getTeacher();
			// this.getBanji()
			// this.getCourses()
		},
		methods: {
			// @on-row-click 点击某一行选中 
			rowClick(row, index) {
				this.$refs.class_selection.toggleSelect(index);
			},

      // 当未关联的行政班被点击选中后
			mutiSelect(sel) {
				this.selectClass = sel;
        console.log(this.selectClass)
			},

			// 点击关联按钮
			handleRelevance() {
				this.selectClass.forEach((item) => {
					let index = this.unSelectedClass.findIndex(item0 => item0.id === item.id);
					this.unSelectedClass.splice(index, 1);
					this.selectedClass.push(item);
          this.adminClassId.push(item.id);
				})
        this.selectClass = []
			},
      // 关联行政部的保存按钮
			relevance() {
				this.showAdmModal = false;
        let data = {
          teachingClassId:this.curSelTeachingClassId,
          adminClassId: this.adminClassId
        }
        console.log(data)

        // that.axios
        //   .post(
        //     that.interfaceUrl + "tkTeachingClass/relationTCAndBJ",that.qs(data))
        //   .then(function(res) {
        //     console.log(res)
        //     if (res.data.state) {
        //       that.$Message.success("保存成功");
				// 			that.showAdmModal = false;
        //     } else {
        //       that.messageError(res.data.msg);
        //     }
        // });

			},

			// 点击搜索
			searchTeachingClass() {
				this.page.pageNum = 1;
				this.getTeachingClass();
			},

      // 获取所有行政班级
			getBanji() {
				let that = this;
				let data = {
					pageNum: that.page.pageNum,
					pageSize: that.page.pageSize,
				}
				that.axios.post(that.interfaceUrl + 'banji/selectAllByPage', that.qs(data)).then(function(res) {
					console.log(res)
					if (res.data.state) {
						that.unSelectedClass = res.data.banJiList;
					} else {
						that.messageError(res.data.msg);
					}
			
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});;
			},

      // 获取所授课程
			getCourses() {
				let that = this;
				let data = {
					pageNum: that.page.pageNum,
					pageSize: that.page.pageSize,
				}
				that.axios.post(that.interfaceUrl + 'tkTeachingClass/findCourses', that.qs(data)).then(function(res) {
					console.log(res)
					if (res.data.state) {
						that.AdminTeachingClassList = res.data.AdminTeachingClassList;
					} else {
						that.messageError(res.data.msg);
					}
			
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});;
			},
			
			// 获取教学班的数据
			getTeachingClass() {
				let that = this;
				that.tableData = teachingClassJson;

        let data = {
              pageNum: that.page.pageNum,
							pageSize: that.page.pageSize,

              teachingClassName: that.searchData.teachingClassName,
              teachingTeacherId: that.searchData.teachingTeacherId,
              courseId: that.searchData.courseId,
        }
				// that.loading = true;
				// that.axios
				// 	.post(
				// 		that.interfaceUrl + "tkTeachingClass/selectAllByPage",that.qs(data))
				// 	.then(function(res) {
				// 		console.log(res)
				// 		if (res.data.state) {
				// 			that.page.totalNum = res.data.dataCount;
				// 			that.tableData = res.data.TeachingClassList;
				// 			that.loading = false;
				// 		} else {
				// 			that.messageError(res.data.msg);
				// 		}
				// 	});
			},

			changePage(i) {
				this.page.pageNum = i;
				this.getTeachingClass();
			},

			// 关联行政班按钮的点击事件
			showAdm(row) {
				this.showAdmModal = true;
				this.unSelectedClass = admClass;
				console.log(this.unSelectedClass)
        this.curSelTeachingClassId = row.id
				console.log(this.curSelTeachingClassId)

				// this.getBanji();
			},

      // 获取授课老师
			getTeacher() {
				let that = this;
				let data = {
					pageNum: that.page.pageNum,
					pageSize: that.page.pageSize,
				}
				that.axios.post(that.interfaceUrl + 'teacher/selectAllByPage', that.qs(data)).then(function(res) {
					console.log(res)
					if (res.data.state) {
						that.teacherList = res.data.teacherList;
						that.loading = false
					} else {
						that.messageError(res.data.msg);
					}
				}).catch(function(e) {
					that.messageError('服务器错误' + e);
				});
			},

			// 点击新增按钮和修改按钮
			show(row) {
				if (row.id) {
					console.log(row)
					this.title = "修改教学班";
					this.data.id = row.id;
					this.data.classNum = row.teachingClassNum;
					this.data.className = row.teachingClassName;
					this.data.courseName = row.courseName;
					this.data.teacher = row.teacher;
					this.data.classroomPeopleNum = row.classroomPeopleNum;
				} else {
					this.title = "新增教学班";
					this.data.id = "";
					this.data.classNum = "";
					this.data.className = "";
					this.data.courseName = "";
					this.data.teacher = "";
					this.data.classroomPeopleNum = 0;
					this.$nextTick(function() {
						this.data.teacherId = "";
					});
					this.data.courseNameId = "";
					this.curTeacher.xm = "";
				}
				this.showUpdeteModal = true;
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
					teachingClassName: that.data.className,
					teachingTeacherId: that.data.teacher*1,
					courseId: that.data.courseName,
					classroomPeopleNum: that.data.classroomPeopleNum
				};
				console.log(data)
				that.axios
					.post(
						that.interfaceUrl + "tkTeachingClass/dealTeachingClass",
						that.qs(data)
					)
					.then(function(res) {
						console.log(data)
						if (res.data.state) {
							that.$Message.success("保存成功");
							that.showUpdeteModal = false;
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
        console.log(this);
				let that = this;
				that.$Modal.confirm({
					closable: true,
					title: "提示",
					content: "确定删除 " + row.teachingClassName + " 吗？",
					onOk: function() {
						that.axios
							.post(
								that.interfaceUrl + "tkTeachingClass/deleteById",
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
