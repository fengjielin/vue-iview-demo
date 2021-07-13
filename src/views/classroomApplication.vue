<template>
	<div class="classroomAppliction">
		<ButtonGroup >
			<Button v-for="(item, index) in btn" :key="index" :type="activeIndex == index ? 'primary' : 'default'"
				@click="changeBtn(index)">{{ item }}</Button>
		</ButtonGroup>

		<div class="content">
			<!-- 表格区域 -->
			<div>
				<Table border :columns="classroomApplictionColumns" :data="classroomApplictionTable"></Table>
				<!-- 分页 -->
				<Page @on-change="changePage" :total="page.totalNum" :current="page.pageNum" :page-size="page.pageSize"
					show-elevator show-total class="page" />
			</div>
		</div>

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

        // 控制通过与退回弹窗的显示与隐藏
				showModal: false,
        title:'',
        data:{
          review:''
        },

				classroomApplictionColumns: [{
						title: "申请人",
						key: 'proposer',
						align: "center",
						minWidth: 202,
					},
					{
						title: "申请课室",
						key: 'classroom',
						align: "center",
						minWidth: 202,
					},
					{
						title: "使用时间",
						key: 'useTime',
						align: "center",
						minWidth: 302,
					},
					{
						title: "原因",
						key: 'cause',
						align: "center",
						minWidth: 502,
					},
					{
						title: "操作",
						align: "center",
						minWidth: 200,
						render: (h, params) => {
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
												this.showPass(params.row)
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
						},
					},
				],
				// 待审核表格绑定的数据
				classroomApplictionTable: [],
				// 分页管理
				page: {
					pageNum: 1,
					pageSize: 10,
					totalNum: 10,
				},

				// 模拟数据
				classroomApplictionTable2: [{
						id: 1,
						status: 0, //审核状态
						proposer: "张三", //申请人
						classroom: "会议大厅201", //申请课室
						useTime: "2021-07-01 09:00 至 2021-07-01 12:00",
						cause: "排练", //原因
					},
					{
						id: 2,
						status: 0, //审核状态
						proposer: "李四", //申请人
						classroom: "会议大厅201", //申请课室
						useTime: "2021-07-01 09:00 至 2021-07-01 12:00",
						cause: "排练", //原因
					},
					{
						id: 3,
						status: 0, //审核状态
						proposer: "王五", //申请人
						classroom: "会议大厅201", //申请课室
						useTime: "2021-07-01 09:00 至 2021-07-01 12:00",
						cause: "排练", //原因
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
				this.classroomApplictionTable = this.classroomApplictionTable2;
				this.changeBtn(0)
        // 后端
			},

			// 切换btn
			changeBtn(index) {
				this.activeIndex = index;
				let list = [];
				this.classroomApplictionTable2.forEach((item) => {
					if (item.status == this.activeIndex) {
						list.push(item);
					}
				});
				this.classroomApplictionTable = list;
			},

      // 打开通过弹窗
			showPass(row) {
        this.data.review = ''
				this.showModal = true
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
					processType: 'T02',
					pId: this.data.id,
					// operatorId: this.userinfo.id,
					operatorId: '',
					review: this.data.review,
					passesOrNot: this.data.passesOrNot,
					processHierarchy: this.data.processHierarchy
				}
				console.log(data)
        
        this.showModalCancel()
			},

			// // 通过操作
			// pass(row) {
			// 	this.$Modal.confirm({
			// 		closable: true,
			// 		title: "提示",
			// 		content: "确定通过吗？",
			// 		onOk: () => {
			// 			// 后端
			// 			let index = this.classroomApplictionTable2.findIndex((item) => item.id == row.id);
			// 			this.classroomApplictionTable2[index].status = 1;
			// 			this.changeBtn(row.status)
			// 		},
			// 	});
			// },
			// // 退回操作
			// sendBack(row) {
			// 	this.$Modal.confirm({
			// 		closable: true,
			// 		title: "提示",
			// 		content: "确定退回吗？",
			// 		onOk: () => {
			// 			// 后端
			// 			let index = this.classroomApplictionTable2.findIndex((item) => item.id == row.id);
			// 			this.classroomApplictionTable2[index].status = 2;
			// 			this.changeBtn(row.status)
			// 		},
			// 	});
			// },
		},
		mounted() {
			this.getCourseTransferData();
			console.log(this.classroomApplictionTable);
		},
	};
</script>

<style>
	.classroomAppliction {
		width: 100%;
		padding: 20px 80px 0;
		height: 100%;
		background-color: #f3f8ff;
	}

	.classroomAppliction .content {
		margin-top: 24px;
		padding: 24px;
		padding-top: 32px;
		height: 754px;
		background-color: #fff;
	}

	.classroomAppliction .content .page {
		text-align: center;
		margin-top: 39px;
	}

	.ivu-table td.applicationTypeStyle {
		color: #04be02;
	}

	.classroomAppliction .ivu-table-header th {
		background-color: #f0faff;
	}
</style>
