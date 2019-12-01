// CORE
	function IDENTIFY(context, compare_to) {
		if(compare_to != undefined) {
			return IDENTIFY(context).toUpperCase() == compare_to.toUpperCase()
		}
		else {
			return ({}).toString.call(context).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
		}
	}

	function UNIVERSAL(r, value) {
		let g

		try {
		// if(globalThis) {
			g = globalThis
		}
		// else {
		catch(ex) {
			g = window
		}
		
		switch(IDENTIFY(r)) {
			case "string":
				if(value == undefined)
					return g[r]
				else
					g[r] = value
				break
			
			default:
				for(let [name, func] of Object.entries(r)) {
					try {
						g[name] = func
						g[name.toLowerCase()] = func
						g[name.toUpperCase()] = func
					} catch(ex) { }
				}
		}
	}

	UNIVERSAL({
		PIPELINE(...params) {
			let result = undefined

			for(let param of params) {
				result = param(result)
			}

			return result
		},
		SEQUENCE(...params) {
			let result = undefined

			for(let param of params) {
				result = param(result)
			}

			return result
		},
		WAIT(args) {
			//console.log(args)
			return Promise.all(args)
		},
		DELAY(callback) {
			return setTimeout(callback, 0)
		},
		READY(callback) {
			// if(document.readyState == "complete")
				// callback()
			// else
				// window.addEventListener('load', callback)
				
			APT(callback)
		},
		THEN: (...params) => UNIVERSAL('ready')(...params),
		APT_LIST: [],
		APT: function(p) {
			//console.log(UNIVERSAL('APT_LIST'), p)
			
			let t
			if(UNIVERSAL('APT_LIST').length > 0)
				t = LAST(UNIVERSAL('APT_LIST')).then(p)
			else
				t = p()
				
			UNIVERSAL('APT_LIST').push(t)
		},
	})
	let THEN = function(p) {
		//console.log(UNIVERSAL('APT_LIST'), p)
		
		let t
		if(UNIVERSAL('APT_LIST').length > 0)
			t = LAST(UNIVERSAL('APT_LIST')).then(p)
		else
			t = p()
			
		UNIVERSAL('APT_LIST').push(t)
	}
	
	
	UNIVERSAL({
		IDENTIFY: IDENTIFY,
		IS_OBJECT(context) {
			return IDENTIFY(context, 'object')
		},
		IS_BOOLEAN(context) {
			return IDENTIFY(context, 'boolean')
		},
		IS_STRING(context) {
			return IDENTIFY(context, 'string')
		},
		IS_NUMBER(context) {
			return IDENTIFY(context, 'number')
		},
		IS_ARRAY(context) {
			return IDENTIFY(context, 'array')
		},
		TO_OBJECT(context) {
			return OBJECT(context)
		},
		TO_BOOLEAN(context) {
			return BOOLEAN(context)
		},
		TO_STRING(context) {
			return STRING(context)
		},
		TO_NUMBER(context) {
			return NUMBER(context)
		},
		TO_ARRAY(context) {
			return ARRAY(context)
		},
		TO_DATE(context) {
			return SUBSTRING(
				FORMAT(
					DATE(context)
				),
				0,
				10
			)
		},
		TO_DATETIME(cotext) {
			return FORMAT(DATE(context))
		},
		IS_UNDEFINED(context) {
			return context === undefined
		},
		IS_NULL(context) {
			return context === null
		},
		//IMPORT: IMPORT,
		UNIVERSAL: UNIVERSAL
	})
	
	THEN(async () => {
		return new Promise((resolve, reject) => {
			window.addEventListener('load', resolve)
		})
	})


	UNIVERSAL({
		BODY(context) {
			//log(context)
			switch(IDENTIFY(context)) {

				case "window":
					return document.body
					break

				case "undefined":
					return document.body
					break

				default:
					return context.parentNode
					// return context.shadowRoot
					// return ROOT(context).shadowRoot
					break

			}
		},
		SHADOW(context) {
			return context.shadowRoot
		},
		INCLUDE(context, param, ref) {
			// PARAMS
				context = PATH(context)
				let name = undefined
				//let async = false
				let async = true
				if(IDENTIFY(param) == 'string')
					name = param
				if(IDENTIFY(param) == 'boolean')
					async = param
				
				if(name != undefined) {
					if(window[name] != undefined) return
				}


			// GET CONTENT
				// ASYNC
				if(async) {
					return fetch(
						context,
						{
							credentials: 'same-origin'
						}
					)
					.then(r => r.text())
					.then(process)

				}
				// SYNC
				else {
					let content = ""
					content = (() => {
						var request = new XMLHttpRequest()
						request.open('GET', context, false)
						request.send(null)
						return request.responseText
					})()
					return process(content)
				}

			// EXTRACT MODULE DATA
				function process(content) {
					if(upper(context).endsWith(".JS")) {
						return eval(`(function() {
							let module_result = {}
							let module = {}
							module.exports = module_result

							function expose(r) {
								return module_result = object(module_result, r)
							}

							${content}

							${(!empty(name) ? `window.${name} = ${name}` : '')}
							return module_result
						})`)()
						//`))()
					}

					if(upper(context).endsWith(".CSS")) {
						let el = find(`style[source="${context}"]`)
						if(el.length != 0) {
							for(let e of el) {
								e.remove()
							}
						}

						document.head.append(
							create(`<style source="${context}" method="include">${content}</style>`)
						)
					}
				}
		},
		DEFINE_TAG(name, constructor) {
			//class Relative extends HTMLElement {
			class Relative extends HTMLElement {
				constructor() {
					super()
					this.attachShadow({ mode: 'open' })
				}

				connectedCallback() {
					this.renderCallback.bind(this)('connected')
					//if(false)
					observe(
						this,
						(...args) => {
							if(this.observe_changes)
							this.renderCallback.bind(this)('changed')
						},
						{
							attributes: true,
							childList: false,
							characterData: false
						}
					)
				}

				renderCallback(callback, ...args) {
					let result = this.render(callback)
					//if(result != undefined) {
					//	this.shadowRoot.innerHTML = result
					//}
				}
				render() { }

				//refresh(callback, ...args) {
				//	this.renderCallback.bind(this)('connected', ...args)
				//}
			}

			// based on function
			if(typeof constructor == 'function') {
				class temp extends Relative { }
				temp.prototype.render = constructor

				window.customElements.define(
					name,
					temp
				)
			}

			// based on object

			// based on html element (like polymer 1)

			// based on class
			else {
				window.customElements.define(
					name,
					constructor
				)
			}
		},
		EXPOSE(r) {
			return UNIVERSAL(r)
			
			module_result = object(module_result, r)

			console.log(module_result)
			
			return module_result
		}
		
	})

// DEBUGGING
	UNIVERSAL({
		LOG: console.log,
		LOG_IN: console.group,
		LOG_OUT: console.groupEnd,
		CALL: async function(f, a = []) {
			console.group(f.name)
			//LOG("STARTED ", FORMAT(NOW()))
			console.groupCollapsed("STARTED ", FORMAT(NOW()))
			console.log("PARAMS  ", a)
			//console.log("TRACE   ", EXPLODE(new Error().stack, " at "))
			console.trace()
			console.groupEnd()
			
			//log(f, a)
			await f(...a)

			LOG("ENDED   ", FORMAT(NOW()))
			console.groupEnd()
			
		}
	})

// SERVER
	UNIVERSAL({
		DB_CONNECT({ type, timeout, host, base, user, pass }) {
			const ADODB = require('node-adodb')
			
			let connection = INLINE(() => {
				switch(type) {
					case "ACCESS_32":
					case "ACCESS_64":
						return	(
								"DSN=" + type + ";"
							+	"DBQ=" + base + ";"
							+	"Uid=" + user + ";"
							+	"Pwd=" + pass + ";"
						)
						break

					case "MYSQL_32":
					case "MYSQL_64":
						return	(
								"DSN=" + type + ";"
							+	"Server=" + host + ";"
							+	"Database=" + base + ";"
							+	"Uid=" + user + ";"
							+	"Pwd=" + pass + ";"
						)
						break
						
					case "ORACLE_32":
					case "ORACLE_64":
						return	(
								"DSN=" + type + ";"
							+	"DBQ=" + host + ";"
							+	"Uid=" + user + ";"
							+	"Pwd=" + pass + ";"
						)
						break
				}
			})
			
			//console.log(connection)
			
			return ADODB.open(connection)
		},
		
		DB_QUERY(connection, query) {
			return connection
				.query(query)
		},

		async DB(connection_data) {
			let connection = await DB_CONNECT(connection_data)
			
			return function(query) {
				return DB_QUERY(connection, query)
			}
		},
		
		WEB() {
			
		},
		
		SHELL() {
			
		}
	})

// TYPES
	// FLUID TYPES
		UNIVERSAL({
			FUNCTION(a) {
				if(a == undefined)
					return function() { }
				else
					return a
			},
			FUNC(a) {
				if(a == undefined)
					return function() { }
				else
					return a
			},
			NUMBER(...args) {
				//console.log(args)
				if(args.length == 2) {
					return reduce(
						args[0],
						args[1],
						0
					)
				}

				else
					return Number(args[0])
			},
			REDUCE_NUMBER(...args) {
				return NUMBER(...args)
			},
			NUMERIC: (...params) => UNIVERSAL('NUMBER')(...params),
			ARRAY(...args) {
				if(args.length == 2 && identify(args[1]) == 'function') {
					return reduce(
						args[0],
						args[1],
						[]
					)
				}
				else {
					let temp = []
					for(let arg of args) {
						switch(identify(arg)) {
							case 'array':
								temp = merge(temp, arg)
								break
							
							default:
								temp = push(temp, arg)
								break
						}
					}
					return temp
				}
				
			},
			REDUCE_ARRAY(...args) {
				return ARRAY(...args)
			},
			OBJECT(...args) {
				if(args.length == 2 && identify(args[1]) == 'function') {
					return reduce(
						args[0],
						args[1],
						{}
					)
				}
				else {
					let temp = {}

					for(let item of args) {
						switch(identify(item)) {
							case 'array':
								if(item.length == 2)
									temp[item[0]] = item[1]
								break

							case 'object':
								temp = Object.assign(
									temp,
									item
								)
								break
						}
					}

					return temp
				}
			},

			// MERGE_OBJECT(...args) {
			// 	return OBJECT(...args)
			// },
			MERGE_OBJECT(...args) {
				return Object.assign(...args)
			},
			OBJECT_MERGE(...args) {
				return Object.assign(...args)
			},
			REDUCE_OBJECT(...args) {
				return OBJECT(...args)
			},
			STRING(...args) {
				switch(IDENTIFY(args[0])) {
					case 'array':
						return REDUCE(args[0], args[1], '')
						break

					case "documentfragment":
						var div = document.createElement('div')
						div.appendChild(args[0])
						return div.innerHTML
						break

					case "object":
						//JSON.stringify()
						break

					// json
					// html
					// function
				
					default:
					case 'string':
						return IMPLODE(args, '')
						//return IMPLODE(args, '').replace("'", "\\\'").replace("\"", "\\\"")
						break
				}
			},
			REDUCE_STRING(...args) {
				return STRING(...args)
			},
		})

	// NUMBERS
		UNIVERSAL({

			ADD(a, b) {
				return a + b
			},

			SUB(a, b) {
				return a - b
			},

			DIV(a, b) {
				return a / b
			},

			MULT(a, b) {
				return a * b
			},

			MOD(a, b) {
				return a % b
			}
			
		})
		
		
		
		
		
			
			
		UNIVERSAL({
			ROUND(context, digits) {
				if(digits == undefined) digits = 0
				let temp = Math.round(context * Math.pow(10, digits)) / Math.pow(10, digits)

				if(context == 0) return 0

				return temp
			},
			PADDING(context, digits) {
				let a = STRING(context)
				//let a = context.toString()
				return `${"0".repeat(digits - a.length)}${a}`
			}
		})


		UNIVERSAL({
			ADD(context, params) {
				switch(identify(context)) {
					case "date":
						return new Date(context.getTime() + params)
						break

					case "number":
						return context + params
						break
				}
			},
			CEIL(number) {
				return Math.ceil(number)
			},
			FLOOR(number) {
				return Math.floor(number)
			},
			RANDOM(context, context2) {
				switch(identify(context)) {
					case "null":
					case "undefined":
						return Math.random()
						break

					case 'number':
						return Math.random() * (context2 - context) + context
						break

					case 'array':
						return context[ROUND(RANDOM(0, context.length - 1))]
						break
				}
			},
			BASE2() {

			},
			BASE16(c) {
				return UPPER(c.toString(16))
			},
			BASE10(c) {
				switch(IDENTIFY(c)) {
					case "string":
						function convertLetterToNumber(str) {
							var out = 0, len = str.length;
							for (let pos = 0; pos < len; pos++) {
								out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
							}
							return Math.abs(out);
						}
						return convertLetterToNumber(c)
						break
				}
			},
			BASE64(c) {
				return btoa(c)
			},

			TO_BASE64(str) {
				return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
				  function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1)
				}))
			},
			FROM_BASE64(str) {
				return decodeURIComponent(atob(str).split('').map(function(c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
				}).join(''))
			}
		})

	// ARRAYS
		UNIVERSAL({
			PUSH(context, value) {
				context.push(value)

				return context
			},
			ARRAY_INSERT(...args) {
				return PUSH(...args)
			},
			RANGE(i) {
				return [...Array(i).keys()]
			},
			CHUNK(context, size) {
				switch(identify(context)) {
					case "array":
						return Array(
								Math.ceil(context.length / size)
							)
							.fill()
							.map(function(_,i){
								return context.slice(
									i * size,
									i * size + size
								);
							})
						break
				}
			},
			LIMIT(context, n1, n2) {
				if(n2 == undefined) {
					n2 = n1
					n1 = 0
				}

				n2 = n1 + n2

				return ARRAY(context).slice(n1, n2)
			},
			CONTAINS(context, find) {
				return ARRAY(context).includes(find)
			},
			INCLUDES(context, find) {
				return ARRAY(context).includes(find)
			},
			BATCH: async function(items, chunk_size) {
				let chunks = CHUNK(items, chunk_size)
				
				let total = []
				
				for(let requests of chunks) {
					let partial = []
					
					for(let request of requests) {
						let result = request()
						total.push(result)
						partial.push(result)
					}
					
					await WAIT(partial)
				}
				
				
				
				return total
			},
			FILTER(context, callback) {
				switch(identify(callback)) {
					default:
					case "function":
						return context.filter(callback)
						break
				}
			},
			WHERE: (...params) => UNIVERSAL('FILTER')(...params),
			HAVING: (...params) => UNIVERSAL('FILTER')(...params),
			EACH(context, callback) {
				return ARRAY(context).map( callback.bind({}) )
			},
			MAP(context, callback) {
				return ARRAY(context).map(callback)
			},
			REDUCE(context, callback, initial) {
				return ARRAY(context).reduce(callback, initial)
			},
			SELECT(context, fields) { // filter columns, turning everything into the same format
				return EACH(
					(function() {
						switch(IDENTIFY(context)) {
							case "array":
								return context
								break

							case "object":
								return VALUES(context)
								break
						}
					})(),
					(c) => {
						let aux = {}
						for(let [name, calc] of ENTRIES(fields)) {
							switch(typeof calc) {
								case "string":
									aux[name] = c[calc]
									break
						
								case "function":
									aux[name] = calc(c)
									break
							}
						}
						
						return aux
					}
				)
			},
			GROUP(context, callback) {
				switch(IDENTIFY(context)) {
					case "object":
						return GROUP([context], callback)
						break;
					case "array":
						return reduce(
							context,
							function(m, c) {
								let temp = {}
								switch(IDENTIFY(callback)) {
									case "function":
										break

									case "array":
										for(let col of callback) {
											temp[col] = c[col]
										}
										break
								}
								
								if(m[JSON.stringify(temp)] == undefined) {
									m[JSON.stringify(temp)] = []
								}
								m[JSON.stringify(temp)].push(c)
								return m
							},
							{}
						)
						break
				}
			},
			GROUP_CONTENT(...args) {
				return VALUES(
					GROUP(...args)
				)
			},
			// INDEX: (...params) => GROUP(...params),
			GROUP_BY: (...params) => GROUP(...params),
			ORDER(context, callback) {
				let asc = function(a, b) {
					if(a > b) return 1
					if(b > a) return -1

					return 0
				}

				let desc = function(a, b) {
					return asc(b, a)
				}
				
				switch(identify(callback)) {
					case "function":
						return context.sort(callback)
						break
						
					case "string":
						switch(upper(callback)) {
							case "ASC":
								return order(context, asc)
								break
							
							case "DESC":
								return order(context, desc)
								break
						}
						break

					case "object":

						return context.sort((a, b) => {
							let result = 0
							for(let [key, value] of entries(callback)) {
								if(value.toUpperCase() == 'DESC') {
									result = desc(ifnull(a[key], ''), ifnull(b[key], ''))
								}
								else {
									result = asc(ifnull(a[key], ''), ifnull(b[key], ''))
								}
								
								if(result != 0) break
							}
							return result
						})
						
						break
				}
			},
			SORT: (...params) => UNIVERSAL('ORDER')(...params),
			
			MAX(context, name) {
				switch(identify(context[0])) {
					case "object":
						let temp = {}
						temp[name] = "desc"

						return first(
							sort(
								context,
								temp
							)
						)[name]
						break
				
					case "array":
						break

					default:
						context = array(context, (m, c) => push(m, IFNULL(IFNAN(c, -Infinity))))
						return Math.max(...context)
						break
				}
			},
			MIN(context, name) {
				//log(identify(context[0]))
				switch(identify(context[0])) {
					case "object":
						let temp = {}
						temp[name] = "asc"
						
						return SORT(
							filter(
								array(
									context,
									(m, c) => push(m, c[name])
								),
								c => c != undefined && c != null
							),
							//temp
							'ASC'
						)[0]

						//return first(
						//	sort(
						//		context,
						//		temp
						//	)
						//)[name]
						break
					
					default:
						context = array(context, (m, c) => {
							return push(m,
								IFNULL(IFNAN(c, +Infinity), +Infinity))
						})
						return Math.min(...context)
				}
			},
			FIRST(context) {
				return ARRAY(context)[0]
			},
			LAST(context) {
				return ARRAY(context).slice(-1)[0]
				//return context[context.lenght - 1]
			},
			SIGNAL(context) {
				if(context > 0) return "+"
				if(context < 0) return "-"
				if(context == 0) return ""
			},
			COUNT(context, params) {
				switch(identify(context)) {
					case "string":
						return (context.match(params)||[]).length
						return

					case "array":
						return context.length
				}
			},
			SUM(context, what) {
				return reduce(
					context,
					function(m, c) {
						if(c[what] == undefined)
							return m
						else
							return m + c[what]
					},
					0
				)
			},
			DISTINCT(context, what) {
				if(what == undefined) {
					return [...new Set(context)]
				}
				else {
					return reduce(
						context,
						function(m, c) {
							if(!m.includes(c[what]))
								m.push(c[what])
							return m
						},
						[]
					)
				}
			},
			UNIQUE: (...params) => DISTINCT(...params),
			IMPLODE(a, b) {
				return ARRAY(a).join(b)
			},
			EXPLODE(a, b) {
				return STRING(a).split(b)
			},
			CONCAT(...params) {
				return ARRAY(params).concat("")
			},
			SUMMARIZE(_context, _group, callback) {
				return OBJECT(
					ENTRIES(
						GROUP(
							_context,
							_group
						)
					),
					(m, [key, value]) => {
						//log(key)
						m[key] = callback(value)
						
						return m
					}
				)
			},
			
			KEY(item, params) {
				return KEYS(
					INDEX(
						OBJECT(item),
						ARRAY(params)
					)
				)[0]
			},

			REMOVE_FIRST(where, n = 1) {
				return ARRAY(where).slice(n, COUNT(where))
			},
			REMOVE_LAST(where, n = 1) {
				return ARRAY(where).splice(0, COUNT(where) - n)
			}
		})

	// BOOLEAN
		UNIVERSAL({
			LIKE(context, pattern, flags) {
				let temp = context.match(new RegExp(pattern, flags))

				return temp != null
			},
			EQUALS(a, b) {
				return a == b
			},
			EQUAL(a, b) {
				return a == b
			},
			STRICT_EQUAL(a, b) {
				return a === b
			},
			STRICT_DIFFERENT(a, b) {
				return a !== b
			},
			NOT_EQUAL(a, b) {
				return a != b
			},
			DIFFERENT(a, b) {
				return a != b
			},
			GREATER_THAN(a, b) {
				return a > b
			},
			GREATER_OR_EQUAL(a, b) {
				return a >= b
			},
			LESS_THAN(a, b) {
				return a < b
			},
			LESS_OR_EQUAL(a, b) {
				return a <= b
			},
			NOT(context) {
				return !context
			},
			BETWEEN(a, b, c) {
				return a >= b && b <= c
			},
			OR(...context) {
				return reduce(
					context,
					function(m, c) {
						return m || c
					},
					false
				)
			},
			AND(...context) {
				return reduce(
					context,
					function(m, c) {
						return m && c
					},
					true
				)
			},
			WHEN(cond, what, unless) {
				if(cond) {
					if(identify(what) == 'function')
						return what()
					else
						return what
				}
				else {
					if(identify(what) == 'function')
						return unless()
					else
						return unless
				}
			},
			IIF: UNIVERSAL('WHEN'),
			OR(...context) {
				return reduce(
					context,
					function(m, c) {
						return m || c
					},
					false
				)
			},
			AND(...context) {
				return reduce(
					context,
					function(m, c) {
						return m && c
					},
					true
				)
			},
			WHEN(cond, what, unless) {
				if(cond) {
					if(identify(what) == 'function')
						return what()
					else
						return what
				}
				else {
					if(identify(what) == 'function')
						return unless()
					else
						return unless
				}
			},
			IIF: UNIVERSAL('WHEN'),
			PIPELINE(...params) {
				let result = undefined

				for(let param of params) {
					result = param(result)
				}

				return result
			},
			SEQUENCE(...params) {
				let result = undefined

				for(let param of params) {
					result = param(result)
				}

				return result
			},
			LIKE(context, pattern, flags) {
				let temp = context.match(new RegExp(pattern, flags))

				return temp != null
			},
			EQUALS(a, b) {
				return a == b
			},
			NOT(context) {
				return !context
			},
			BETWEEN(a, b, c) {
				return a >= b && b <= c
			},

			CONSIDER(item, consider, callback) {
				if(
						EMPTY(consider)
					||	consider == false
				) {
					return true
				}

				return callback(item, consider)
			},

		})

	// STRING
		UNIVERSAL({
			TRIM(context) {
				try {
				return string(context).trim()
				} catch(ex) { console.error(ex); console.log(context) }
				
			},
			SERIALIZE(form) {
				switch(IDENTIFY(form)) {
					case "object":
						//return '?' +
						return IMPLODE(
								EACH(
									ENTRIES(form),
									([key, value]) => INLINE(() => {
										switch(IDENTIFY(value)) {
											case "array":
												return IMPLODE(
													EACH(
														value,
														c => (
																encodeURIComponent(key)
															+	'[]='
															+	encodeURIComponent(c)
														)
													),
													'&'
												)
												break

											default:
												return (
														encodeURIComponent(key)
													+	'='
													+	encodeURIComponent(value)
												)
												break
										}
									})
								),
								'&'
							)
						break

					default:
						// Setup our serialized data
						var serialized = [];

						// Loop through each field in the form
						for(let field of FIND(form, 'input, textarea, select')) {

							let arr = field.hasAttribute("multiple") ? "[]" : ""
							// Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
							if (
									!field.name
								||	field.disabled
								||	field.type === 'file'
								||	field.type === 'reset'
								||	field.type === 'submit'
								||	field.type === 'button'
							)
								continue;

							// If a multi-select, get all selections
							if (field.type === 'select-multiple') {
								for (var n = 0; n < field.options.length; n++) {
									if (!field.options[n].selected) continue;
									serialized.push(encodeURIComponent(field.name) + arr + "=" + encodeURIComponent(field.options[n].value));
								}
							}

							// Convert field data to a query string
							else if (
									(
											field.type !== 'checkbox'
										&& field.type !== 'radio'
									)
								||	field.checked
							) {
								serialized.push(
										encodeURIComponent(field.name)
									+	arr
									+	"="
									+	encodeURIComponent(field.value)
								)
							}
						}

						return serialized.join('&');
						break
				}
			},
			HTML_ESCAPE(html) {
				var escape = document.createElement('textarea');
					escape.textContent = html
					
				return escape.innerHTML
					.replace(/\'/g, "&#039;")
					.replace(/\"/g, "&#034;")
			},
			HTML_UNESCAPE(html) {
				var escape = document.createElement('textarea');
					escape.innerHTML = html;
				return escape.textContent;
			},
			UPPER(context) {
				try {
					if(
							context == undefined
						||	context == null
					)
						return ''
					else
						return IFNULL(context.toString(), '').toUpperCase()
				} catch(ex) { console.log(context) }
			},
			LOWER(context) {
				return IFNULL(context, '').toLowerCase()
			},
			SUBSTRING(context, start, finish) {
				if(finish == undefined) {
					return STRING(context).substring(start)
				}
				else {
					return STRING(context).substring(start, finish)
				}
			},
			LEFT(context, finish) {
				return SUBSTRING(context, 0, finish)
			},
			SUBSTR(context, start, finish) {
				if(finish == undefined) {
					return STRING(context).substr(start)
				}
				else {
					return STRING(context).substr(start, finish)
				}
			},
			PREPEND(context, params) {
				switch(IDENTIFY(context)) {
					case "string":
						return `${params}${context}`
						break

					default:
						context.insertBefore(context.children[0], params)
						return context
						break
				}
			},
			APPEND(context, params) {
				if(LIKE(IDENTIFY(context), 'html.*')) {
					context.append(params[0])
				}
				switch(IDENTIFY(context)) {
					case "string":
						return `${IFNULL(context, "")}${params}`
						break

					default:
						switch(IDENTIFY(params)) {
							case "string":
								context.innerHTML = STRING(context.innerHTML) + params
								break

							default:
								context.append(params)
								break
						}
						return context
						break
				}
			},
			REVERSE(context) {
				switch(IDENTIFY(context)) {
					case "array":
						return context.reverse()
						break

					case "string":
						return context.split("").reverse().join("")
						break
				}
			},

			TO_STRING(el) {
				switch(IDENTIFY(el)) {
					case "array":
					case "object":
						return JSON.stringify(el)
						break

					default:
						return el.toString()
						break
				}
			},
			TO_HTML(el) {
				return HTML_ESCAPE(
					TO_STRING(el)
				)
			}
		})

	// OBJECT
		UNIVERSAL({
			PARSE(obj) {
				let data = null
				// try to convert if it's an object
				try { data = eval(`(${obj})`) }
				catch (ex){	data = obj }

				if(contains(['object', 'array', 'boolean'], identify(data)))
					data = data
				else if(obj == '')
					data = ''
				else if(Number(obj) == obj)
					data = Number(obj)
				else if(obj == "true" || obj == "TRUE")
					data = true
				else if(obj == "false" || obj == "FALSE")
					data = false
				else
					data = obj

				return data
			},
			STRINGIFY(obj, prop) {
				var placeholder = '____PLACEHOLDER____';
				var fns = [];
				try {
					var json = JSON.stringify(
						obj, function(key, value) {
						if (typeof value === 'function') {
							fns.push(value);
							return placeholder;
							}
							return value;
						}, 2);
						json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function(_) {
							return fns.shift();
						}
					);
					
				} catch(ex) {
					//console.log(callback)
					//console.log(ex)
					// return []
					return undefined
				}
				//return 'this["' + prop + '"] = ' + json + ';';
				return json
			},
			ENTRIES(el) {
				switch(identify(el)) {
					case 'object':
						return Object.entries(el)
						break
						
					case "map":
						return Array.from(el.entries())
						break

					case 'array':
						return el
						break

					default:
						return []
				}
			},
			REPLACE(context, args) {
				return REDUCE(
					ENTRIES(args),
					(m, [key, value]) => STRING(m.replace(new RegExp(key, "g"), value)),
					context
				)
			},
			KEYS(el) {
				switch(IDENTIFY(el)) {
					case "object":
						return Object.keys(el)
						break
					
					case "map":
						return Array.from(el.keys())
						break
						
					default:
						return []
						break
				}
			},
			REF(content) {
				if(UNIVERSAL('__REFERENCE__') == undefined)
					UNIVERSAL('__REFERENCE__', {})
				
				
				let r = UNIVERSAL('__REFERENCE__')
				
				let k = STRINGIFY(content)
				if(r[k] == undefined)
					r[k] = OBJECT(content)
				
				return r[k]
			},
			REFERENCE: (...params) => UNIVERSAL('REF')(...params),
			VALUES(el) {
				switch(IDENTIFY(el)) {
					case "object":
						return Object.values(el)
						break
					
					case "map":
						return Array.from(el.values())
						break
						
					default:
						return Array.from(el)
						return []
						break
				}
			},
			INLINE(...params) {

				switch( IDENTIFY( FIRST(params) ) ) {
					case "string":

						return params[2].bind({
							_SECTION: params[0]
						})(...params[1])
						break

					case "function":
						return FIRST(params).bind({})(...REMOVE_FIRST(params))
						break

					case "array":
						return LAST(params).bind({})(...REMOVE_LAST(params))
						break
				}
			},
			LAMBDA(callback, ...params) {
				return callback(...params)
			},
			REMOVE(context, element) {
				if(LIKE(IDENTIFY(context), 'html.*')) {
					if(element == undefined) {
						context.remove()
					}
					else {
						context.removeAttribute(element)
					}
				}

				switch(typeof context) {
					case "array":
						const index = context.indexOf(element);

						if (index !== -1) {
							context.splice(index, 1);
						}
						break
					default:
						if(IDENTIFY(OBJECT(context).remove) == 'function') {
							context.remove()
						}
						//else {
						//	context.removeAttribute(element)
						//}
				}
			},
			CLONE(a) {
				return parse(stringify(a))
			},
			DECODE(context, content) {
				switch(context) {
					case "html_entities":
						var e = document.createElement('div')
						e.innerHTML = content

						return e.childNodes.length === 0
							? ""
							: e.childNodes[0].nodeValue
						break
				}
			},

			OBJECT_INDEX(data, callback) {
				let t = {}
				for(let c of ENTRIES(data)) {
					t[callback(c)] = c
				}
				return t
			},


		})

// DECLARATIVE CALC
	// EMPTY
		UNIVERSAL({
			IFNULL(a, b) {
				if(a == null || a == undefined) {
					return b
				}
				else {
					return a
				}
			},
			IFNAN(a, b) {
				if(isNaN(a)) return b
				return a
			},
			IFEMPTY(a, b) {
				if(EMPTY(a)) return b

				return a
			},
			EMPTY(context) {
				return (
						context == undefined
					||	context == null
					||	context == ""
					||	(
								IDENTIFY(context) == 'array'
							&&	context.length == 0
						)
					||	(
								IDENTIFY(context) == 'object'
							&&	Object.keys(context).length == 0
						)
					//||	STRINGIFY(context) == "{}"
					//||	STRINGIFY(context) == "[]"
				)
			},
		})

	// TIME
		UNIVERSAL({
			NOW() {
				return new Date()
			},
			// CONVERSION OF TIME LEVELS TO MILISECONDS
				YEAR(n) {
					switch(identify(n)) {
						case "number":
							return 1000 * 60 * 60 * 24 * 365 * n
							break

						case "date":
							return n.getYear() + 1900
							break
					}
				},
				MONTH(n) {
					switch(IDENTIFY(n)) {
						case "number":
							return 1000 * 60 * 60 * 24 * 30 * n
							break

						case "date":
							return n.getMonth()
							break
					}
				},
				DAY(n) {
					switch(IDENTIFY(n)) {
						case "number":
							return 1000 * 60 * 60 * 24 * n
							break

						case "date":
							return n.getDay()
							break
					}
				},
				HOUR(n) {
					switch(IDENTIFY(n)) {
						case "number":
							return 1000 * 60 * 60 * n
							break

						case "date":
							return n.getHours()
							break
					}
				},
				MINUTE(n) {
					switch(IDENTIFY(n)) {
						case "number":
							return 1000 * 60 * n
							break

						case "date":
							return n.getMinutes()
							break
					}
				},
				SECOND(n) {
					switch(IDENTIFY(n)) {
						case "number":
							return 1000 * n
							break

						case "date":
							return n.getSeconds()
							break
					}
				},

			DATE(context) {
				switch(IDENTIFY(context)) {
					case "string":
						return Date.parse(context)
						break

					case "number":
						return new Date(context - TIMEZONE())
						break
				}
			},
			TIMEZONE() { // GET CURRENT TIMEZONE
				return new Date().getTimezoneOffset() * 60 * 1000
			},
			FORMAT(context, how) {
				switch(IDENTIFY(context)) {
					case "date":
						return (
							implode(
								[
									padding(context.getFullYear(), 4),
									padding(context.getMonth() + 1, 2),
									padding(context.getDate(), 2),
								],
								'-'
							)
							+ ' ' +
							implode(
								[
									padding(context.getHours(), 2),
									padding(context.getMinutes(), 2),
									padding(context.getSeconds(), 2),
								],
								':'
							)
						)
						break
				}
			},
			TIME(context) { // CONVERT DATE OR STRING TO MILISECONDS
				switch(IDENTIFY(context)) {
					case 'string':
						switch(COUNT(context)) {
							// COMPLETE DATE AND TIME WITHOUT UTC
							case 19:
								return new Date(context.replace(" ", "T") + "+0000").getTime()
								break

							// ANYTHING ELSE
							default:
								return new Date(context).getTime()
								break
						}
						break

					case 'date':
						return context.getTime()
						break
				}
			},
			AGO(context, precision) { // CONVERT DATE REFERENCE TO INTUITIVE FORMAT
				// TIME CONVERSION
					let t_context = TIME(context)
					let t_now = TIME(NOW())
					let t_diff = t_now - t_context

				// REFERENCE
					let periods = {
						"year": 31536000000,
						"month": 2592000000,
						"week": 604800000,
						"day": 86400000,
						"hour": 3600000,
						"minute": 60000,
						"second": 1000,
					}


				// FIND OUT WHICH RANGE
					let i = 0
					for( let [name, value] of  ENTRIES(periods) )  {

						if(t_diff > value)
							break

						i++
					}

					let considered = ENTRIES(periods)[i]
					
					let value
					if(precision == undefined)
						value = FLOOR( t_diff / considered[1] )
					else
						value = ROUND( t_diff /considered[1], precision )

					return `${value} ${considered[0]}${value > 1 ? "s" : ""}`
			},

			DAY_OF_WEEK(a) { // GET WHICH DAY OF THE WEEK A DATE FALLS INTO
				return a.getDay()
			},

			WEEKEND_DAYS(a, b) { // HOW MANY WEEKEND DAYS (SUNDAYS AND SATURDAYS) ARE BETWEEN TWO DATES
				// DEFAULTS
					a = DATE(TIME(a) + DAY(1))
					b = DATE(TIME(b) + DAY(1))


				// COMMON VARIABLES
					let total = 0
					let start_middle, finish_middle


				// MIDDLE BLOCK REFERENCE
					start_middle = DATE(
							TIME(a)
						+   DAY(
									7
								-   INLINE(() => {
										let temp = DAY_OF_WEEK(a)
										// log(temp)
				
										if(temp == 0) temp = 7
										return temp
									})
							)
					)
					finish_middle = DATE( TIME(b) - DAY(DAY_OF_WEEK(b)) )
				
				// START BLOCK
					if(start_middle >= a) {
						let temp = (TIME(start_middle) - TIME(a) + DAY(1)) / DAY(1)
				
						if(temp > 2)
							temp = 2
						
						// log("\nstart")
						// log(a)
						// log(start_middle)
						// log(temp)
						total += temp
					}

				// MIDDLE BLOCK
					if(finish_middle > start_middle) {
				
						let temp = FLOOR((TIME(finish_middle) - TIME(start_middle) + DAY(1)) / DAY(7)) * 2
				
						// log("\nmiddle")
						// log(DATE(TIME(start_middle) + DAY(1)))
						// log(finish_middle)
						// log(temp)
						total += temp
					}
				

				// FINISH BLOCK
					let start_finish = DATE(TIME(finish_middle) + DAY(1))
					let finish_finish = finish_middle
				
					if(finish_finish > start_finish) {
				
						let temp = 7 - (
							(TIME(start_finish) - TIME(finish_finish)) / DAY(1)
						)
				
						// log(temp)
						if(temp < 0)
							temp = 0
						
						// log("\nfinish")
						// log(start_finish)
						// log(finish_finish)
						// log(temp)
						total += temp
					}

				//log(total)
				return total
			},

			BUSINESS_DAYS() {

			},
			DIFF_DAYS(a, b) { // CALC NUMBER OF DAYS BETWEEN TO DATES
				a = TIME(a)
				b = TIME(b)


				return (a - b) / DAY(1)
			}

		})

	// SET
		UNIVERSAL({
			INDEX_JOIN(type, a, b, on_index, on_join) {
				let index_a = INDEX(a.source, a.index)
				let index_b = INDEX(b.source, b.index)
				let result = []
				
				//log(type, a, b, on_index, on_join)
				
				let join_index = JOIN(
					INLINE(() => {
						switch(type) {
							case "LEFT_OUTER":
								return "LEFT"
								break

							case "RIGHT_OUTER":
								return "RIGHT"
								break

							case "OUTER":
								return "FULL"
								break

							default:
								return type
								break
						}
					}),
					IFNULL(KEYS(index_a), []),
					IFNULL(KEYS(index_b), []),
					on_index
				).join_source

				// log(KEYS(index_a))
				// log(KEYS(index_b))
				// log(join_index)

				for(let group_match of join_index) {
					result.push(
						JOIN(
							type,
							index_a.get(group_match.a),
							index_b.get(group_match.b),
							on_join
						)
					)
				}


				return result.flat()
			},
			JOIN(type, a, b, on, on2) {
				// USE INDEX JOIN INSTEAD OF COMMON JOIN

				a = IFNULL(a, [])
				b = IFNULL(b, [])

				//log(a, b)
				if(on2 != undefined) {
					return INDEX_JOIN(type, a, b, on, on2)
				}
				//log(type, a, b, on, on2)

				type = upper(type)
				let used = new Set()
				let result = []
				
				let join_source = []
				
				// INNER
				for(let row_a of a) {
					let join_source_b = []
					for(let row_b of b) {
						if(on(row_a, row_b)) {
							if(INCLUDES(['INNER', 'FULL', 'LEFT', 'RIGHT'], type)) {
								
								let nrow = OBJECT(row_a, row_b)
								
								join_source.push({
									a: row_a,
									b: row_b
								})
								
								result.push(nrow)
							}

							used.add(row_a)
							used.add(row_b)
						}
					}
				}
				
				used = [...used]
				
				// LEFT OUTER
				for(let row_a of a) {
					if(!INCLUDES(used, row_a)) {
						if(INCLUDES(['OUTER', 'LEFT', 'LEFT_OUTER', 'FULL'], type)) {
							let nrow_a = OBJECT(row_a)

							join_source.push({
								a: row_a,
								b: null
							})

							result.push(nrow_a)
						}
					}
				}
				
				// RIGHT OUTER
				let join_source_b = []
				for(let row_b of b) {
					if(!INCLUDES(used, row_b)) {
							if(INCLUDES(['OUTER', 'RIGHT', 'RIGHT_OUTER', 'FULL'], type)) {
								let nrow_b = OBJECT(row_b)

								join_source.push({
									a: null,
									b: row_b
								})
								
								result.push(nrow_b)
							}
					}
				}

				
				
				Object.defineProperty(
					result,
					'join_source',
					{
						//value: values(temp_join_source),
						value: join_source,
						enumerable: false
					}
				)
					
				
				return result
			},

			CARTESIAN_PRODUCT(aa, ab) {
				let result = []
				if(aa.length > 0 && ab.length > 0) {
					for(let a of aa) {
						for(let b of ab) {
							result.push(object(a, b))
						}
					}
				}
				
				if(ab.length == 0) {
					for(let a of aa) {
						result.push(a)
					}
				}
				
				if(aa.length == 0) {
					for(let b of ab) {
						result.push(b)
					}
				}
				
				return result
			},
			ARRAY_OBJECT(source) {
				return ARRAY(source, (m, c) => PUSH(m, { value: c }))
			},

			LEFT_JOIN(a, b, on1, on2) {
				return JOIN("LEFT", a, b, on1, on2)
			},
			LEFT_OUTER_JOIN(a, b, on1, on2) {
				return JOIN("LEFT_OUTER", a, b, on1, on2)
			},
			RIGHT_JOIN(a, b, on1, on2) {
				return JOIN("RIGHT", a, b, on1, on2)
			},
			RIGHT_OUTER_JOIN(a, b, on1, on2) {
				return JOIN("RIGHT_OUTER", a, b, on1, on2)
			},
			OUTER_JOIN(a, b, on1, on2) {
				return JOIN("LEFT_OUTER", a, b, on1, on2)
			},
			FULL_OUTER_JOIN: (...params) => UNIVERSAL('OUTER_JOIN')(...params),
			FULL_JOIN(a, b, on1, on2) {
				return JOIN("FULL", a, b, on1, on2)
			},
			INNER_JOIN(a, b, on1, on2) {
				return JOIN("INNER", a, b, on1, on2)
			},

			UNION(a, ...b) {
				return a.concat(...b)
			},
			MERGE(context, ...params) {
				switch(IDENTIFY(context)) {
					case "array":
						return context.concat(...params)
						break

					case "object":
						return Object.assign(context, ...params)
						break
				}
			},
			MERGE_DEEP(target, ...sources) {
				if (!sources.length) return target;
				const source = sources.shift();

				if (IDENTIFY(target) == 'object' && IDENTIFY(source) == 'object') {
					for (const key in source) {
					if (IDENTIFY(source[key]) == 'object') {
						if (!target[key]) Object.assign(target, { [key]: {} });
						MERGE_DEEP(target[key], source[key]);
					} else {
						Object.assign(target, { [key]: source[key] });
					}
				}
				}

				return MERGE_DEEP(target, ...sources);
			},
			
			
			INDEX(context, callback) {
				switch(IDENTIFY(context)) {
					case "object":
						return GROUP([context], callback)
						break;
					case "array":
						let grouped = reduce(
							context,
							function(m, c) {
								let temp = {}
								switch(IDENTIFY(callback)) {
									case "function":
										break

									case "array":
										for(let col of callback) {
											temp[col] = c[col]
										}
										break
								}
								
								if(m[JSON.stringify(temp)] == undefined) {
									m[JSON.stringify(temp)] = [
										REFERENCE(temp),
										[]
									]
								}
								m[JSON.stringify(temp)][1].push(c)
								return m
							},
							{}
						)
						
						return new Map(VALUES(grouped))
						break
				}
			},
		})

	// INCLUDES
		function GET_INCLUDE_SRC(where) {
			try {
				let _previous = CONTEXT( where, "include_path" )

				if( EMPTY(_previous) )
					_previous = undefined
					
				

				/*let _path = PATH(
						// current one
						IMPLODE(
							REMOVE_LAST(
								EXPLODE( STATE(where, "src"), "/" ),
								1
							),
							"/"
						),
						// previous path
						_previous
					)
					*/
					
				let _path = PATH(
						// current one
						IFEMPTY(
							IMPLODE(
								REMOVE_LAST(
									EXPLODE( STATE(where, "src"), "/" ),
									1
								),
								"/"
							),
							IMPLODE(
								REMOVE_LAST(
									EXPLODE( PATH(), "/" ),
									1
								),
								"/"
							)
						),
						// previous path
						_previous
					)
					
					

				let _file = LAST( EXPLODE( STATE(where, "src"), "/" ) )
				
				// log("path", _path)
				// log("file", _file)

				CONTEXT( where, "include_path", _path )
				if(where.hasAttribute('src'))
					CONTEXT( where, "parent_path", _path + "/" + _file )

				// log(_path + "/" + _file)
				return _path + "/" + _file
			} catch(ex) {
				console.error(ex)
			}

			return STATE( where, "src" )
			//return _new_path
		}



		// RELATIVE MODULES THAT DEPEND ON THE ARCHITECTURE
			DEFINE_TAG('include-js', function(c) {
					// console.log(c)
				if(this.rendered == true) return
				this.rendered = true

				let _src = GET_INCLUDE_SRC(this)

				if( !EMPTY( STATE(this, 'src') ) ) {
				
					//this.innerHTML = `<script src='${_src}' ></script>`
					fetch(_src)
					.then(c => c.text())
					.then(c => {
						INLINE(
							new Function(
								`/* INLINE - ${CONTEXT(this, 'parent_path')} */\n${c}
								`
							).bind(this)
						)
					})
					//.then(c => this.innerHTML = `<include-js> <script> ${c} </script> </include-js>`)

					
				}
				else {

					if(this.children.length == 0)
						return

					if(this.children[0].tagName == "SCRIPT") {
						// eval(this.children[0].textContent)

						INLINE(
							new Function(
								`/* INLINE - ${CONTEXT(this, 'parent_path')} */\n${this.children[0].textContent}
								`
							).bind(this)
						)

					}

				}
				
			})
				

			DEFINE_TAG('include-html', function(c) {
				if(this.rendered == true) return
				this.rendered = true

				let _src = GET_INCLUDE_SRC(this)
				
				FROM(_src)
				.then(c => {
					
					switch( UPPER(STATE(this, 'mode')) ) {
						case "replace":
							// 1 - import content into the same scope
							this.outerHTML = c
							break

						case "shadow":
							this.style.display = "flow-root"
							this.shadowRoot.innerHTML = "<slot></slot>"
							this.shadowRoot.innerHTML = c
							break

						default:
							// 2 - recognize what came from where and the
							this.style.display = "flow-root"
							this.shadowRoot.innerHTML = "<slot></slot>"
							this.innerHTML = c
							break

					}

				})
				
			})
			
			
			DEFINE_TAG('include-css', function(c) {
				if(this.rendered == true) return
				this.rendered = true

				let _src = GET_INCLUDE_SRC(this)

				this.innerHTML = `<link rel='stylesheet' href='${_src}' />`
			})
			
			
			DEFINE_TAG('include-img', function(c) {
				if(this.rendered == true) return
				this.rendered = true

				let _src = GET_INCLUDE_SRC(this)

				this.innerHTML = `<img src='${_src}' />`
			})
			
			// DEFINE_TAG('relative-js', function(c) {
				// let src = STATE(this, 'src')
				
				// if(!empty(src))
					// THEN( () => import(src) )
			// })
			
			
			// THEN(() => {
			// 	EACH(
			// 		MERGE(
			// 			FIND(document.head, 'relative-js'),
			// 			FIND(document.body, 'relative-js'),
			// 		),
			// 		(el) => {
			// 			let src = STATE(el, 'src')
			// 			log(src)
				
			// 			if(!empty(src))
			// 				THEN( import(src) )
			// 		}
			// 	)
			// })
			
			
			//setTimeout(() => {
			// THEN(() => {
			// 	EACH(
			// 		MERGE(
			// 			FIND(document.head, '[type="relative"]'),
			// 			FIND(document.body, '[type="relative"]'),
			// 		),
			// 		c => {
			// 			LOG(c)
			// 			if(c.hasAttribute('src')) {
			// 				c.outerHTML = c.outerHTML.replace(/script/g, 'include-js')
			// 			}
			// 			else {
			// 				c.outerHTML = `<include-js>${c.outerHTML}</include-js>`
			// 			}
			// 		}
			// 	)
			// })
			//}, 100)

// RENDERING
	// RENDER
		DEFINE_TAG('chart-stack', function() {
			this.shadowRoot.innerHTML = `
				<slot></slot>
			`
		})


		UNIVERSAL({
			DISPLAY_TOOLTIP() {

			},
			DISPLAY_DIALOG() {

			},
			DRAW_SCALE({ items, callback, orientation }) {
				return `
					<chart-area
						style='
							display: flex;
							align-items: flex-end;
							height: 2em;
						'
					>
						${STRING(items, (m, c, i) => {
							let t = c
							if(identify(callback) == 'function') {
								t = callback(c, i)
							}

							return `${m}
								<section
									style='
										flex-grow: 1;
										flex-basis: 0;
										text-align: center;
										margin: 0;
										padding: 0;
										min-width: 0;
									'
								>${t}</section>
							`
						})}
					</chart-area>
				`
			},
			DRAW_STACK(content) {
				return `
					<chart-y-stack
						style='
							flex-grow: 1;
							flex-basis: 0;
						'
					>
						${content}
					</chart-y-stack>
				`
			},
			DRAW_PARALLEL() {
			},
			DRAW_BAR() {
			},
			DRAW_CIRCLE() {
			},
			COLOR(...params) {
				function convertLetterToNumber(str) {
				  var out = 0, len = str.length;
				  for (let pos = 0; pos < len; pos++) {
					out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
				  }
				  return Math.abs(out);
				}

				let palettes = {
					MPN65: [
							'ff0029', '377eb8', '66a61e', '984ea3', '00d2d5', 'ff7f00', 'af8d00',
							'7f80cd', 'b3e900', 'c42e60', 'a65628', 'f781bf', '8dd3c7', 'bebada',
							'fb8072', '80b1d3', 'fdb462', 'fccde5', 'bc80bd', 'ffed6f', 'c4eaff',
							'cf8c00', '1b9e77', 'd95f02', 'e7298a', 'e6ab02', 'a6761d', '0097ff',
							'00d067', '000000', '252525', '525252', '737373', '969696', 'bdbdbd',
							'f43600', '4ba93b', '5779bb', '927acc', '97ee3f', 'bf3947', '9f5b00',
							'f48758', '8caed6', 'f2b94f', 'eff26e', 'e43872', 'd9b100', '9d7a00',
							'698cff', 'd9d9d9', '00d27e', 'd06800', '009f82', 'c49200', 'cbe8ff',
							'fecddf', 'c27eb6', '8cd2ce', 'c4b8d9', 'f883b0', 'a49100', 'f48800',
							'27d0df', 'a04a9b'
						]
				}
				
				switch(params.length) {
					case 1:
						switch(IDENTIFY(params[0])) {
							case "number":
								return COLOR('mpn65', params[0])
								break

							case "string":
								// return palettes['MPN65'][convertLetterToNumber(params[0]) % palettes['MPN65'].length]

								return INLINE(() => {
									let a = params[0]
									let size = FLOOR(a.length / 3)

									//log("\n\n\n")
									//log(a)
									a = REVERSE(a)
									let values = {
										r: SUBSTR(a, 0, size),
										g: SUBSTR(a, size, size),
										b: SUBSTR(a, size * 2, a.length - (size * 2)),
									}

									//log(JSON.stringify(values, true, 4))

									EACH(KEYS(values), key => values[key] = BASE10(values[key]))
									//log(JSON.stringify(values, true, 4))

									//EACH(KEYS(values), key => values[key] = values[key] % 16)
									//log(JSON.stringify(values, true, 4))

									EACH(KEYS(values), key => values[key] = SUBSTR(
											BASE16(16 - (values[key] % 16)) + BASE16(16 - (values[key] % 16)),
											0,
											2
										)
									)
									/*log(JSON.stringify(values, true, 4))

									log_color(`${IMPLODE(
										VALUES(values),
										""
									)}`)
									*/
									return `#${IMPLODE(
										VALUES(values),
										""
									)}`
								})
								break
						}
						break


					case 2:
						let p = palettes[UPPER(params[0])]
						return `#${p[params[1] % p.length]}`
						break

					case 3:
						break
				}
			}
		})

	// HTML
		UNIVERSAL({
			OBSERVE(who, how, what) {
				let observer = new MutationObserver(how);
				observer.observe(who, what);
				return observer
			},
			
			CLASS_COMPOSE(_target, _source) {
				class temp { }

				// Copies the properties from one class to another
				function copy(_target, _source) {
					for (let key of Reflect.ownKeys(_source)) {
						if	(!includes(['constructor', 'prototype', 'name'], key)) {
							let desc = Object.getOwnPropertyDescriptor(_source, key)
							
							// only inherit if your class doesn't implement it
							if(_target[key] == undefined)
								Object.defineProperty(_target, key, desc)
						}
					}
				}

				copy(temp, _target)
				copy(temp.prototype, _target.prototype)

				return temp
			},
			HTML(html, more) {
				let el = undefined

				if(html instanceof Element) {
					switch(html.tagName) {
						case "STYLE":
							let style = HTML("style")
							style.innerText = html.innerText
							el = style
							break

						default:
							if(!!html.content)
								el = document.importNode(html.content, true)
							else
								el = create(html.outerHTML)
							break
					}
				}
				else if(!!html) {
					html = html.trim()// remove spaces

					// if it's a tag, create a fragment
					if(html.startsWith("<")) {
						var	i
							,a=document.createElement("div")
							,b=document.createDocumentFragment();
							a.innerHTML=html;
							
						// append all children to a fragment
							while(i = a.firstChild) {
								//console.log(i)
								b.appendChild(i);
							}
							
						// the result should be something, right?
						if(b.childNodes.length > 0) {
							// templates are not returned directly
							if(b.childNodes && b.childNodes[0].tagName == "TEMPLATE")
								el = create(b.childNodes[0])
							else
								// if nothing went wrong, here's the resulintg NodeList
								el = 	b.childNodes.length == 1
										?	b.childNodes[0]
										:	b.childNodes
						}
						else {
							throw "Relative could not create " + html
							// this can happen because some elements only work inside table elements
						}
					}
					// if it's a tag name, call itself
					else {
						el = document.createElement(html)
					}
				}

				return el
			},
			NEXT(el) {
				return el.nextElementSibling
			},
			PREVIOUS(el) {
				return el.previousElementSibling
			},
			// PARENT(el) {
			// 	return el.parentElement
			// },
			GET(context, pos) {
				switch(identify(context)) {
					case "array":
						return context[pos % context.length]
						break
						
					case "object":
						return context[pos]
						break
						
					case "map":
						return context.get(pos)
						break

					default:
						switch(identify(context.getRootNode())) {
							case "htmldocument":
								return STATE(context, pos)
								break

							default:
								return ROOT(context, pos)
								break
						}
						break
				}
			},
			SESSION(context, data) {
				if(data == undefined)
					return session[stringify(context)]
				else {
					session[stringify(context)] = data
					return data
				}
				
			},
			ROOT(...params) {
				switch(params.length) {
					case 1:
						return params[0].getRootNode().host
						break

					case 2:
						return STATE(ROOT(params[0]), params[1])
						break

					case 3:
						return STATE(ROOT(params[0]), params[1], params[2])
						break
				}
			},
			HOST(el) {
				return el.getRootNode().host
			},
			STYLE(context, name, value) {
				context.style[name] = value
			},
			SET(el, param, value) {
				let use_el = null
				switch(identify(el.getRootNode())) {
					case "htmldocument":
						use_el = el
						break

					default:
						use_el = ROOT(el)
						break
				}

				switch(identify(value)) {
					case "function":
						STATE(use_el, param, value(STATE(use_el, param)))
						break

					default:
						STATE(use_el, param, value)
						break
				}
			},
			VALUE(context) {
				switch(IDENTIFY(context)) {
					case "htmlinputelement":
					case "htmlselectelement":
					case "htmlelement":
						switch(context.tagName) {
							case "SELECT":
								if(context.hasAttribute("multiple")) {
									var result = []

									for(let opt of FIND(context, 'option')) {
										if (opt.selected) {
											result.push(opt.value || opt.text)
										}
									}

									return result
								}
								else {
									return context.value
								}
								break

							case "INPUT":
								if(UPPER(context.getAttribute('type')) == 'CHECKBOX') {
									if(context.checked) {
										return context.value
									}
								}
								else
									return context.value
								break

						}
						break

					case "object":
						return Object.values(context)
						break
					
					case "array":
						if(IDENTIFY(context[0]) == 'htmlelement') {
							return reduce(
								context,
								(m, c) => {
									//console.log(state(c, 'input'))
									//if(state(c, 'input') != undefined)
									//	return push(m, state(c, 'input'))

									if(c.value != undefined) {
										return PUSH(m, PARSE(c.value))
									}

									return m
								},
								[]
							)
						}
						break
				}
			},
			
			CONTEXT(here, prop, value) {
				if(here._context == undefined)
					here._context = { }

				if(value == undefined) {
					let el = here
					while(el != undefined) {
						if(el._context != undefined) {
							if(el._context[prop] != undefined) {
								return el._context[prop]
							}
						}

						if(el.parentElement == undefined)
							el = el.getRootNode().host
						else
							el = el.parentElement
					}

					return undefined
				}
				else {
					if(typeof value == 'function')
						here._context[prop] = value.bind(this)
					else
						here._context[prop] = value
				}
			},
			STATE_REMOVE(here, name) {
				return STATE(here, name, null)
			},
			STATE_GET(here, name) {
				return STATE(here, name, undefined)
			},
			STATE_SET(here, name) {
				return STATE(here, name, value)
			},
			STATE(here, name, value) {
				if(here == undefined) return


				switch(IDENTIFY(here)) {
					case "location":
						return IFNULL(
							STATE(here.search, `${name}[]`),
							STATE(here.search, name)
						)
						break

					case "string":
						// QUERY STRING
						if(LIKE(here, '\\?')) {
							const urlParams = new URLSearchParams(here)

							if(LIKE(name, '\\[\\]')) {
								//log(urlParams.getAll(name))

								let result = EACH(
									urlParams.getAll(name),
									c => PARSE(c)
								)
								if(result.length > 0)
									return result
								else
									return undefined
							}
							else {
								return PARSE(urlParams.get(name))
							}
						}
						// SELECTOR
						else {

						}
						break

					default:
						if(name == undefined) {
							return new Proxy(here,
								{
									get(target, property) {
										return state(here, property)
									},
									set(target, property, value) {
										return state(here, property, value)
									}
								}
							)
						}
						else {
							// log("STATE", here, name, value)
							// log(value == undefined)
							// log(value == null)

							// NO VALUE NAME, THEN RETURN THE CONTENT
							if(IS_UNDEFINED(value)) {
								// log("get")
								if(typeof name == "string" && here.hasAttribute(name)) {
									// CONVERT STRING ATTRIBUTE CONTENT INTO USEFUL DATA
									return PARSE(here.getAttribute(name))
								}
							}
							// VALUE CONTENT SET TO NULL, REMOVE IT
							else if(IS_NULL(value)) {
								// log("remove")
								here.removeAttribute(name)
							}
							// SET ATTRIBUTE VLUE
							else {
								// log("set")
								let new_value
								// convert data to valid attribute value
								if(typeof value === 'object')
									new_value = stringify(value)
								else
									new_value = value

								// preventing changing what didn't change, which causes mutationobserver calls
								if(here.getAttribute(name) != new_value) {
									here.setAttribute(name, new_value)
								}
								
								return true
							}
						}
						break
				}
				
			},
			LISTEN(...args) {
				let where = document
				let when = ""
				let what = () => {}

				if(args.length == 3)
					[where, when, what] = args

				if(args.length == 2)
					[when, what] = args

				try {
					where.addEventListener(when, what)
				} catch(ex) { }
			},
			FIND(...args) {
				let where = document
				let what = ""
				
				if(args.length == 1)
					[what] = args

				if(args.length == 2)
					[where, what] = args

				return Array.from(
					where.querySelectorAll(what)
				)
			}
		})

		UNIVERSAL({
			CREATE: HTML
		})




		UNIVERSAL({
			RENDER(el) {
				if(el.render != undefined)
					el.render('connected')
				else
					ROOT(el).render("connected")
			},
			SHOW(el) {
				el.style.display = "block"
			},
			HIDE(el) {
				el.style.display = "none"
			},
			VISIBLE(el) {
				return el.offsetHeight != 0
			},
			MOBILE() {
				return typeof window.orientation !== 'undefined'
			},
			LOADING(yes) {
				if(window.loading_count == undefined) {
					window.loading_count = 0
				}
				let box = find(document.body, '#loading')[0]
				if(box == undefined)
					echo(`
						<section
							id='loading'
							style='
								z-index: 99999;
							'
							dialog
						>
							<div>Loading...</div>
						</section>
					`)
				box = find(document.body, '#loading')[0]

				if(box != undefined) {
					if(yes) {
						loading_count++
						box.removeAttribute('hidden')
					}
					else {
						loading_count--

						if(loading_count <= 0)
							box.setAttribute('hidden', '')
					}
				}
			},
			ECHO(context, params) {
				if(params == undefined && context != undefined) {
					params = context
					context = document.body
				}

				return APPEND(context, params)
			},
			CLEAR(el) {
				el.innerHTML = ""
			},

			FRAGMENT(content) {
				let _fragment = new DocumentFragment
				let _template = document.createElement("template")
				//_template.innerHTML = content


				return _fragment
			},


			EVENTS: { },
			EVENT_DEFINE(callback) {
				let events = UNIVERSAL('EVENTS')
				events[callback.toString()] = callback

				return KEYS(events).indexOf(callback.toString())
			},
			EVENT(position) {
				return VALUES(UNIVERSAL('EVENTS'))[position]
			}
		})

	// TABLE
		UNIVERSAL({
			/*TABLE_SORT(table) {
				var th = table.tHead, i; th && (th = th.rows[0]) && (th = th.cells);
				if (th) i = th.length;
				else return; // if no `<thead>` then do nothing
				while (--i >= 0) (function (i) {
					var dir = 1;
					th[i].style.cursor = 'pointer'
					th[i].addEventListener('click', function () {sortTable(table, i, (dir = 1 - dir))});
				}(i));
			},*/
			TABLE(data, callback) {
				let columns = [...reduce(
					data,
					(m, c) => {
						each(keys(c), (c2) => m.add(c2))
						return m
					},
					new Set()
				)]


				return `
					<table>
						<thead>
							<tr>
								${reduce(
									//keys(data[0]),
									columns,
									(m, c) =>	{
										return `${m}<th>${c}</th>`
									},
									""
								)}
							</tr>
						</thead>

						<tbody>
							${reduce(
								data,
								(m, c) =>	{
									return `${m}<tr>
										${reduce(
											//keys(data[0]),
											columns,
											(m2, c2) => {
												return `${m2}<td field='${c2}'>${empty(c[c2]) ? '' : c[c2]}</td>`
											},
											""
										)}
									</tr>`
								},
								""
							)}
						</tbody>
					</table>
				`
			},
			COLUMN_SORT(table, col, reverse) {
				var	tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
					tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
					i;

				// log(tr)
				reverse = -((+reverse) || -1);
				// tr = tr.sort(
				// 	function (a, b) { // sort rows
				// 		return (
				// 				reverse // `-1 *` if want opposite order
				// 			* lambda(function() {
				// 				//console.log(parseFloat(a.cells[col].textContent))
				// 				if(parseFloat(a.cells[col].textContent) > parseFloat(b.cells[col].textContent))
				// 					return 1

				// 				if(parseFloat(a.cells[col].textContent) < parseFloat(b.cells[col].textContent))
				// 					return -1

				// 				return a.cells[col].textContent.trim() // using `.textContent.trim()` for test
				// 					.localeCompare(b.cells[col].textContent.trim())
				// 			})
				// 		)
				// 	}
				// )

				tr = tr.sort( function (a, b) { // sort rows
					log(a, b, col)
					return (
							reverse // `-1 *` if want opposite order
						* INLINE(function() {
							if(
									parseFloat(a.cells[col].textContent)
								>	parseFloat(b.cells[col].textContent)
							)
								return 1

							if(
									parseFloat(a.cells[col].textContent)
								<	parseFloat(b.cells[col].textContent)
							)
								return -1

							return (
								a.cells[col].textContent.trim()
								.localeCompare(b.cells[col].textContent.trim())
							)
						})
					)
				} )


				for(i = 0; i < tr.length; ++i)
					tb.appendChild(tr[i]); // append each row in order
			},
			
			TABLE_SORT(table) {
				// var th = table.tHead, i; th && (th = th.rows[0]) && (th = th.cells);
				// if (th) i = th.length;
				// else return; // if no `<thead>` then do nothing
				// while (--i >= 0) (function (i) {
				// 	var dir = 1;
				// 	th[i].style.cursor = 'pointer'
				// 	th[i].addEventListener(
				// 		'click',
				// 		function () {
				// 			COLUMN_SORT(table, i, (dir = 1 - dir))
				// 		}
				// 	);
				// }(i));

				EACH( FIND(table, 'thead tr'),
					tr => {
						let dir = 1
						EACH( FIND(tr, 'th'),
							(th, i) => {
								th.style.cursor = 'pointer'
								LISTEN(th, 'click', function() {
									COLUMN_SORT(table, i, (dir = 1 - dir))
								})
							}
						)
					}
				)
			},
			
			SORTABLE: (...params) => {
				if(params.length == 0) {
					EACH(
						FIND(BODY(), 'table'),
						el => UNIVERSAL('SORTABLE')(el)
					)
				}
				else {
					UNIVERSAL('TABLE_SORT')(...params)
				}
			},
		})

	// RENDER
		DEFINE_TAG('render-tooltip', function() {
			this.style.display = 'none'
			this.style.position = 'fixed'
			this.style.width = 'auto'
			this.style.zIndex = '999'
			this.style.border = '1px solid #000'
			this.style.background = '#fff'
			
			
			this.shadowRoot.innerHTML = '<slot></slot>'

			let parent = this.parentNode

			if(parent.tagName == "foreignObject") {
				parent = parent.parentNode
				BODY().append(this)
			}

			LISTEN(parent, 'mouseenter', (event) => {
				// LOG("mouseenter", event)
				SET_POSITION(event)
				
				this.style.display = 'block'
			})

			
			const SET_POSITION = ( event ) => {
				// this.style.left = this.parentNode.offsetLeft + this.parentNode.offsetWidth + 16
				//this.style.top = this.parentNode.offsetTop - this.parentNode.parentNode.scrollTop
				
				this.style.left = event.clientX + 16
				this.style.top = event.clientY + 16
				
				if(this.offsetTop + this.offsetHeight > window.innerHeight - 16)
					this.style.top = window.innerHeight - this.offsetHeight - 16
				
				if(this.offsetLeft + this.offsetWidth > window.innerWidth - 16)
					this.style.left = window.innerWidth - this.offsetWidth - 16
				
			}
			
			LISTEN(parent, 'mousemove', (event) => {
				// LOG("mousemove", event)
				SET_POSITION(event)
			})
			
			
			
			LISTEN(parent, 'mouseleave', () => {
				this.style.display = 'none'
			})
		})


		DEFINE_TAG('render-label', function() {
			this.style.position = 'absolute'
			this.style.width = 'auto'
			this.style.whiteSpace = 'nowrap'
			//this.style.zIndex = '999'
			this.shadowRoot.innerHTML = '<slot></slot>'
			
			let parent = this.parentNode
			
			let side = LOWER( IFNULL( STATE(this, "side"), "out" ) )
			let position = LOWER( IFNULL( STATE(this, "position"), "left" ) )
			
			switch(position) {
				case "middle":
					
					break
					
				case "left":
					
					break
					
				case "right":
					switch(side) {
						case "out":
							this.style.left = "100%"
							break
							
						case "inner":
							
							break
					}
					this.style.left = parent
					break
				
			}
			
		})

		DEFINE_TAG('render-modal', function() {
			
			
		})
			
		

		UNIVERSAL({
			TABS(content) {
				let tab_names = ""
				let tab_contents = ""
				
				
				let id = 0
				for(let [name, value] of ENTRIES(content)) {
					tab_names += `<section
						style='
							float: left; 
							width: auto; 
							margin: 0;
							cursor: pointer;
							padding: .5em;
							background:${tab_contents == "" ? "#fff" : "transparent"};
							color:${tab_contents == "" ? "#000" : "#fff"};
						'
						class='tab_name'
						tab_id='${id}'
						onclick='
							EACH(
								FIND(this.parentNode.parentNode, ".tab_name"),
								c => {
									if(STATE(c, "tab_id") == STATE(this, "tab_id")) {
										c.style.background = "#fff"
										c.style.color = "#000"
									}
									else {
										c.style.background = "transparent"
										c.style.color = "#fff"
									}
								}
							)
							EACH(
								FIND(this.parentNode.parentNode, ".tab_content"),
								c => {
									if(STATE(c, "tab_id") == STATE(this, "tab_id")) {
										c.style.display = "block"
									}
									else {
										c.style.display = "none"
									}
								}
							)
						'
						>${name}</section>`
					tab_contents += `<section
						style='
							display:${tab_contents == "" ? "block" : "none"};
							height: calc(100% - 64px);
						'
						class='tab_content'
						tab_id='${id}'
					>${value}</section>`
					
					id++
				}
				
				return `
					<section
						style='
							border: 1px solid #ccc;
							padding: 0;
							margin: 0;
							height: 100%;
							width: 100%;
						'
					>
						<section
							style='
								padding: 0;
								margin: 0;
								padding-top: .25em;
								padding-left: .25em;
								background: #369;
							'
						>${tab_names}</section>
						<section
							style='
								background: #fff;
								overflow-y: auto;
							'
						>${tab_contents}</section>
					</section>
				`
			}
		})

	// FORM INPUT ELEMENTS
		DEFINE_TAG("input-tag", function(callback) {
			// DEFAULT STYLES
				//if(callback != 'connected') return
				//this.observe_changes = true

				this.style.display = 'flow-root'
				//this.style.display = 'block'
				this.style.minHeight = '2em'

			// REVERSE OBJECT DUE TO THE WAY DATALIST WORKS
				let options = []
				let reverse_options = {}
				let normal_options = {}
				for(let el of FIND(this, 'option')) {
					reverse_options[el.textContent] = parse(el.value)
					normal_options[el.value] = el.textContent
					options.push({
						value: el.value,
						text: el.textContent,
						selected: el.hasAttribute('selected')
					})
				}
				this.innerHTML = ''


			// KEYPRESS EVENT
				let key_pressed = false
				CONTEXT(this, 'keypress', (c, e) => {
					if(e.code != undefined)
						key_pressed = true

					//console.log(e)

					if(
						OR(
							INCLUDES([",", "Enter"], e.code),
							e.keyCode == 13
						)
					) {
						CONTEXT(this, 'selected')("keypress", c, e, true)
					}
					else {
						// let item = FIND(
						// 		this.shadowRoot,
						// 		`
						// 			datalist option[value^="${c.value}"],
						// 			datalist option[text^="${c.value}"]
						// 		`
						// 	)
						// if(items.length == 1) {
						// 	log("test")



						// 	CONTEXT(this, 'selected')("input", c, e, true)
						// }
					}

					// switch(e.code) {
					// 	case ",":
					// 	case "Enter":
					// 		CONTEXT(this, 'selected')(c, e, true)
					// 		break
					// }
				})

			// ITEM SELECTION EVENT
				CONTEXT(this, 'selected', (event_name, c, e, enter = false) => {
					//console.log(enter)
					//console.log(key_pressed)
					if(enter == false && key_pressed == true) {
						key_pressed = false
						return
					}

					//console.log("input")

					if(!EMPTY(c.value))		
						this.INCLUDE_VALUES(c.value)
				
					c.value = ''

					if(event_name != "blur")
						c.focus()

					if(IDENTIFY(this.onchanged) == 'function')
						this.onchanged()
				})

			// CLEAR CONENT
				this.CLEAR = () => {
					this.innerHTML = ''
				}

			// INCLUDE ELEMENTS
				this.INCLUDE_VALUES = (value) =>  {
					EACH(
						EXPLODE(value, ';'),
						(value) => {
							// let original_value = value
							// let actual_value = FILTER()
							let option = reverse_options[value]

							if(option == undefined) {
								value = normal_options[value]
								option = reverse_options[value]
							}

							// if(option == undefined) {
							// 	value = original_value
							// 	option = original_value
							// }

							// log(value, option)

							this.innerHTML += `
								<span
									onclick='this.remove()'
									style='
										cursor: pointer;
										background: #ddd;
										border: .2em solid #fff;
										min-height: 2.5em;
										max-width: 100%;
										text-overflow: ellipsis;
										overflow: hidden;
									'
								>${value}
									<render-tooltip>${value}</render-tooltip>
									
									${
											this.hasAttribute("multiple")
										?	`
												<input
													type='hidden'
													multiple
													name='${state(this, 'name')}[]'
													value='${reverse_options[value]}'
													style='
														display: inline; 
														width: inital;
													'
												>
											`
										: 	`
												<input
													type='hidden'
													name='${state(this, 'name')}'
													value='${reverse_options[value]}'
													style='
														display: inline; 
														width: inital;
													'
												>
											`

									}
									

								</span>
							`
						}
					)
			}

			if(this.hasAttribute('initial_value'))
				this.INCLUDE_VALUES(STATE(this, 'initial_value'))
			
			this.shadowRoot.innerHTML = `
				<section style='border: 1px solid #ddd;'>
					<slot></slot>
					<input
						list='suggestions'
						type='text'
						style='
							font-size: 16px;
							border: 0;
							line-height: 1.4em;
							width: 100%;
							padding: .2em;
							outline: none;
						'
						placeholder='Type here'
						oninput='
							CONTEXT(this, "selected")("input", this)
						'
						onkeydown='
							CONTEXT(this, "keypress")(this, event)
						'
						onblur='
							CONTEXT(this, "selected")("blur", this)
						'
					/>
					<datalist id='suggestions'
					>
						${lambda(() => {
							//if(this.innerHTML != "") { 
							//	let temp = this.innerHTML
							//	this.innerHTML = ''
							//	return temp
							//}
							//else {
								//if(Object.keys(options).length > 0) {
								return REDUCE(
									options,
									(m, c) => {
										return APPEND(
											m,
											`<option
												value='${c.text}'
												text='${c.value}'
												onclick='CONTEXT(this, "selected")("blur", this)'
											>${c.value}</option>`
										)
									},
									''
								)
								//} else {
								//	try {
								//		return reduce(
								//			parse(state(this, 'options')),
								//			(m, c) => {
								//				return append(
								//					m,
								//					`<option>${c}</option>`
								//				)
								//			},
								//			''
								//		)
								//	} catch(ex) { } 
								//}
							//}
						})}
					</datalist>
				</section>
			`
		})

	// STRUCTURE ELEMENTS
		UNIVERSAL({

			TABS(content) {
				let tab_names = ""
				let tab_contents = ""
				
				
				let id = 0
				for(let [name, value] of ENTRIES(content)) {
					tab_names += `<section
						style='
							float: left; 
							width: auto; 
							margin: 0;
							cursor: pointer;
							padding: .5em;
							background:${tab_contents == "" ? "#fff" : "transparent"};
							color:${tab_contents == "" ? "#000" : "#fff"};
						'
						class='tab_name'
						tab_id='${id}'
						onclick='
							EACH(
								FIND(this.parentNode.parentNode, ".tab_name"),
								c => {
									if(STATE(c, "tab_id") == STATE(this, "tab_id")) {
										c.style.background = "#fff"
										c.style.color = "#000"
									}
									else {
										c.style.background = "transparent"
										c.style.color = "#fff"
									}
								}
							)
							EACH(
								FIND(this.parentNode.parentNode, ".tab_content"),
								c => {
									if(STATE(c, "tab_id") == STATE(this, "tab_id")) {
										c.style.display = "block"
									}
									else {
										c.style.display = "none"
									}
								}
							)
						'
						>${name}</section>`
					tab_contents += `<section
						style='
							display:${tab_contents == "" ? "block" : "none"};
							height: calc(100% - 64px);
						'
						class='tab_content'
						tab_id='${id}'
					>${value}</section>`
					
					id++
				}
				
				return `
					<section
						style='
							border: 1px solid #ccc;
							padding: 0;
							margin: 0;
							height: 100%;
							width: 100%;
						'
					>
						<section
							style='
								padding: 0;
								margin: 0;
								padding-top: .25em;
								padding-left: .25em;
								background: #369;
							'
						>${tab_names}</section>
						<section
							style='
								background: #fff;
								overflow-y: auto;
							'
						>${tab_contents}</section>
					</section>
				`
			},
				
		})

// HTTP
	// HTTP
		UNIVERSAL({
			ROOT_PATH(path) {
				if(path == undefined) {
					if(UNIVERSAL('VAR_ROOT_PATH') == undefined) {
						// return window.location.href
						
						// ignore the query parameters for this function
						return EXPLODE(window.location.href, '?')[0]
					}
					else {
						return UNIVERSAL('VAR_ROOT_PATH')
					}
				}
				else {
					UNIVERSAL('VAR_ROOT_PATH', path)
				}
			},
			PATH(path, reference) {
				// log("PATH", "path=" + path, "reference=" + reference)
				if(reference == undefined) {
					reference = ROOT_PATH()
				}
				
				return (new URL(path, reference)).href
			},
			REDIRECT(path) {
				window.location.href = path
			},
			FROM: async function(context, options = {}) {// fetch data if not an object
				// REFERENCE FOR CACHING DIFFERENCE
					let request_name = JSON.stringify({
						context: context,
						options: options
					})

				// SET GET PARAMS
					if(UPPER(OBJECT(options).method) == 'GET') {
						context = `${INLINE(() => {
							if(LIKE(context, '\\?')) {
								return `${context}&`
							}
							else {
								return `${context}?`
							}
						})}${SERIALIZE(options.content)}`
					}

				// SET POST PARAMS
					//if(UPPER(OBJECT(options).method) == 'POST') {
					//if(!EMPTY(OBJECT(options).post)) {
					//	context = `${INLINE(() => {
					//		return `${context}&`
					//	})}${SERIALIZE(options.content)}`

					//	var data = {some:"data",even:"more"};
					//	var headers = new Headers({
					//		"Content-Type":"application/x-form-urlencoded"
					//	});
					//	var params = [];
					//	for(i in data){
					//	   params.push(i + "=" + encodeURIComponent(data[i]));
					//	}
					//}

				// SET HEADERS

				// INIT MEMORY CACHE
					if(EMPTY(window.FROM_CACHE)) window.FROM_CACHE = {}
				

				switch(identify(context)) {
					case 'string':
						let response
						if(
							//	options.session == true
							//&&	sessionStorage.getItem(context) !== null
							//&&
							window.FROM_CACHE[request_name] != undefined
							//&& false
						) {
							//response = JSON.parse(sessionStorage.getItem(context))
							response = window.FROM_CACHE[request_name]
							//log(response)
						}
						else {
							response = await fetch(
								context,
								object(
									options.fetch,
									{
										credentials: 'same-origin'
									}
								)
							)
							.then(r => {
								//log(r)
								return r.text()
							})
							.then(r => {
								// TODO: use headers to find out what format should be used
								try {
									return JSON.parse(r)
								} catch(ex) {
									return r
								}
							})
							.catch(r => {
								console.error(context, r)
								//return r.text()
							})
							// response = await fetch(
							// 	context,
							// 	object(
							// 		options.fetch,
							// 		{
							// 			credentials: 'same-origin'
							// 		}
							// 	)
							// ).then(r => {
							// 	if(UPPER(context).endsWith('.JSON'))
							// 		return r.json()
							// 	else
							// 		return r.text()
							// })
							// sessionStorage.setItem(context, JSON.stringify(response))
							window.FROM_CACHE[request_name] = response
						}
						return response
						break
				
					default:
						return context
				}
				//return await fetch(context, Object.assign({ credentials: 'same-origin' }, options)).then(r => r.json())
			}
		})

	// URL PARAMS
		UNIVERSAL({

			PARAMS_PUSH(w, new_params) {
				w.history.pushState(
					"",
					"",
					w.location.pathname + "?" + PARAMS_MERGE(
						w.location.search,
						new_params
					)
				)
			},

			PARAM(name) {
				return STATE(window.location, name)
			},

			PARAMS(obj) {

				switch(IDENTIFY(obj)) {
					case "string":
						return new URLSearchParams(obj)
						break

					case "object":
						let result = []

						EACH(ENTRIES(obj), ([key, value]) => {

							if(IDENTIFY(value) == 'array') {
								EACH(ENTRIES(value), c => {
									PUSH(result, [ `${key}[]`, c ])
								})
							}
							else {
								PUSH(result, [ key, value ])
							}
						})

						return new URLSearchParams(result)
						break
				}
				
			},
			PARAMS_STRING(obj) {
				switch(IDENTIFY(obj)) {
					case "urlsearchparams":
						return obj.toString().replace(/\%5B\%5D/g, "[]")
						break

					case "object":
						return PARAMS(obj).toString().replace(/\%5B\%5D/g, "[]")
						break
				}
			},

			PARAMS_APPEND(params, obj) {

			},

			PARAMS_OBJECT(obj) {

				switch(IDENTIFY(obj)) {
					case "string":
						return PARAMS_OBJECT( PARAMS(obj) )
						break

					case "urlsearchparams":
						let result = {}

						for(let [key, value] of obj.entries() ) {
							// log(key, value)

							if(key.includes("[]")) {
								if(result[key.replace("[]", "")] == undefined) {
									result[key.replace("[]", "")] = []
								}

								result[key.replace("[]", "")].push(value)
							}
							else {
								result[key] = value
							}
						}

						return result
						break

					case "object":
						return obj
						break
				}
				

			},

			PARAMS_MERGE(...inputs) {
				return PARAMS(
					OBJECT_MERGE(
						...EACH(inputs, c => PARAMS_OBJECT(c))
					)
				)
			},

		})

	// URL HISTORY
		UNIVERSAL({

			HISTORY_PUSH() {

			},

			WINDOW_SET_PARAMS(w, query) {
				// log(query)
				// log(PARAMS_STRING(query))
				w.history.pushState(
					"",
					"",
					"?" + PARAMS_STRING(query)
				)
			},

			WINDOW_CLEAR_PARAMS(w) {
				w.history.pushState(
					"",
					"",
					w.location.pathname + "?"
				)
			},

		})

	// FORM HANDLING
		UNIVERSAL({

			ID(...params) {
				let context, selector
				switch(COUNT(params)) {
					case 1:
						context = BODY()
						selector = params[0]
						break


					case 2:
						context = params[0]
						selector = params[1]
						break
				}

				return FIND(context, `#${selector}`)[0]
			},


			CLASS(...params) {
				let context, selector
				switch(COUNT(params)) {
					case 1:
						context = BODY()
						selector = params[0]
						break


					case 2:
						context = params[0]
						selector = params[1]
						break
				}

				return FIND(context, `.${selector}`)
			},

			FORM_GET() {

			},

			FORM_SET() {

			},

			FORM_OBJECT(obj) {
				let _form = new FormData(obj)

				let _temp = {};
				_form.forEach((value, key) => {
					log(key, value)
					if(key.includes("[]")) {
						let _key = key.replace("[]", "")

						if(_temp[_key] == undefined)
							_temp[_key] = []

						_temp[_key].push(value)
					}
					else {
						_temp[key] = value	
					}
				})

				return _temp
			},

			FORM_STRING(obj) {
				return PARAMS_STRING(
					FORM_OBJECT( obj )
				)
			},

		})

	// SHARE HTTP CONTEXT
		UNIVERSAL({

			EMBED2(page) {
				

				return `
					<include-html src='${page}${window.location.search}'></include-html>
				`
			},
			FRAME(page) {
				return `
					<iframe
						src='${page}${window.location.search}'
						style='
							width: 100%;
							height: 100%;
							border: 0;
						'
					></iframe>
				`
			},
			DATA(page) {
				let search = window.location.search
				// log(page.includes("?"))
				if(page.includes("?"))
					search = search.replace("?", "&")
				return FROM(`${page}${search}`)
			},

		})
