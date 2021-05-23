// const initalState = () => ({
// 	api_url: "/api.json",
// 	step_section: 0,
// 	step_question: 0,
// 	sections: [],
// 	form: {},
// 	visible: false,
//  showing_confirm : false,
// })
const initalState = () => ({
	api_url: "/api.json",
	step_section: 2,
	step_question: 9,
	sections: [],
	form: {
		nick_name: "Vinicius",
		full_name: "Vinicius Bassalobre",
		doc_number: "406.145.898-19",
		birthdate: "08/04/1992",
		gender: "Masculino",
		marital_status: "Namorando",
		has_children: "Sim",
		level_of_education: "Superior completo",
		height: 1.74,
		weight: 84,
		level_of_mental_health: 7,
		cardiovascular: ['Nenhuma das opções'],
		breathing: ["Nenhuma das opções"],
		gastrointestinal: ['Nenhuma das opções'],
		nervous_system: ['Nenhuma das opções'],
		osteomuscular_rheumatological: ['Nenhuma das opções'],
		endocrinology: ['Nenhuma das opções'],
		ophthalmology: ['Nenhuma das opções'],
		otorhinolaryngology: ['Nenhuma das opções'],
		urology: ['Nenhuma das opções'],
		skin: ['Nenhuma das opções'],
		allergies: ['Nenhuma das opções']
	},
	visible: false,
	showing_confirm: false
})

Vue.directive('mask', VueMask.VueMaskDirective)
new Vue({
	el: '#app',
	data() {
		return initalState()
	},
	created() {
		this.loadSections()
	},
	watch: {
		step_question() {
			this.showing_confirm = false
		}
		// 	form: {
		// 		handler(val) {
		//			console.log(val)
		// 		},
		// 		deep: true
		// 	}
	},
	computed: {
		show_level_crud() {
			let has_show = this.current_section?.show_level_crud ? true : false
			let has_input = this.form[this.input.field].filter(x => !['Nenhuma das opções', 'Outras'].includes(x)).length > 0
			return has_show && has_input
		},
		global_index() {
			return `${this.step_section}_${this.step_question}`
		},
		current_section() {
			return this.getCurrentSection()
		},
		current_question() {
			return this.getCurrentQuestion()
		},
		input() {
			let current_question = this.getCurrentQuestion()
			return current_question?.input ?? {}
		},
		has_more_question() {
			return this.current_section?.questions.length > (this.step_question + 1)
		},
		has_more_sections() {
			return this.sections.length > (this.step_section + 1)
		},
		others_selected() {
			if (!Array.isArray(this.form[this.input.field])) {
				return false
			}
			return this.form[this.input.field].includes("Outras")
		},
		can_go_back() {
			return this.global_index != '0_0'
		},
		show_progress() {
			return this.current_section?.title ? true : false
		},
		progress_sections() {
			let steps = this.sections.map((x, i) => ({
				title: x.title,
				progress_color: x.progress_color,
				index: i,
				total_questions: x.questions.length
			}))
			return steps
		},
		can_next() {
			let input_success = this.form[this.input.field] != undefined && this.testRegex(this.input.validation_rule, this.form[this.input.field])
			let passed_others = true
			if (this.others_selected) {
				passed_others = this.form[`${this.input.field}_others`] ? true : false
			}
			return input_success && passed_others
		}
	},
	methods: {
		changeOption(none = false) {
			if (none) {
				this.form[this.input.field] = this.form[this.input.field].filter(x => x == "Nenhuma das opções")
			} else {
				this.form[this.input.field] = this.form[this.input.field].filter(x => x != "Nenhuma das opções")
			}
		},
		getCurrentSection() {
			return this.sections[this.step_section]
		},
		getCurrentQuestion() {
			let section = this.getCurrentSection()
			let question = section?.questions[this.step_question]
			if (question.condition) {
				question = question[this.form[question.condition]]
			}
			this.defineDefaultValues(question)
			return question
		},
		defineDefaultValues(question) {
			if (this.form[question.input.field] == undefined) {
				this.$set(this.form, question.input.field, question.input.default ?? null)
			}
		},
		testRegex(rule, value) {
			let regex = new RegExp(rule ?? '$')
			return regex.test(value ?? "")
		},
		getProgressSectionPercentage(step) {
			if (step.index > this.step_section) return "0%"
			if (step.index < this.step_section) return "100%"
			let total = this.sections[step.index].questions.length
			let current = this.step_question + 1
			let percentage = Math.round(current * 100 / total)
			return `${percentage}%`
		},
		loadSections() {
			fetch(this.api_url).then(resp => {
				resp.json().then(data => {
					this.sections = data.sections
					this.visible = true
				})
			})
		},
		nextQuestion(confirmed = false) {
			if (this.show_level_crud && !confirmed) {
				return this.showing_confirm = true
			}
			if (this.has_more_question) {
				this.step_question++
				return this.$forceUpdate()
			}
			if (this.has_more_sections) {
				this.step_question = 0
				this.step_section++
				return this.$forceUpdate()
			}
			this.finishWizard()
			this.$forceUpdate()
		},
		previousQuestion() {
			if (this.step_question > 0) {
				return this.step_question--
			}
			if (this.step_question == 0) {
				this.step_section--
				return this.step_question = this.current_section.questions.length - 1
			}
		},
		finishWizard() {
			alert("Finalizado !!")
			console.log(this.form)
		}
	}
})