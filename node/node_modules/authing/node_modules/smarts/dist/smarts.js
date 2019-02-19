module.exports = function({objList, stringList, reactiveSetter, vue}={}){
  return {
    setThing({option, list=this.getsmart(objList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype, push, strings, targets}={}) {
      return new Promise((resolve, reject)=>{
        let index = this.thingIndex({option, list, obj, keys, keymatchtype, strings})
        if(obj="debug"){
          console.log('index')
          console.log(index)
          console.log('list')
          console.log(list)
        }
        if(index >= 0 && list){
          if(targets){
            for(var i=0;i<targets.length;i++){
              let value = this.getsmart(option, targets[i], undefined)
              if(value){
                this.setsmart(list[index], targets[i], value)
              }
            }
          } else {
            list.splice(index, 1, option)
          }
          // list[index] = option
        } else if(push && list) {
          list.push(option)
          index = list.length-1
        }
        resolve(index)
      })
    },
    setThings({options, list=this.getsmart(objList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype, push}={}) {
      return new Promise((resolve, reject)=>{
        if(options && list) {
          for(let option of options){
            this.setThing({option, list, obj, keys, keymatchtype, push})
          }
        }
        resolve()
      })
    },
    optIn(option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      if(typeof option === 'object'){
        obj = true
      }
      if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
        return true
      } else if (obj && list) {
        for (var i=0; i < list.length; i++) {
          for(var indKey=0; indKey<keys.length;indKey++){
            if(keymatchtype == 'broad'){
              if (list[i] && this.getsmart(list[i], keys[indKey], undefined) == this.getsmart(option, keys[indKey], undefined) && this.getsmart(list[i], keys[indKey], undefined) !== undefined) {
                return true
              } else if(list[i] && typeof list[i] == 'string' && list[i] == this.getsmart(option, keys[indKey], undefined) && this.getsmart(option, keys[indKey], undefined) !== undefined){
                return true
              }    
            } else {
              if (list[i] && this.getsmart(list[i], keys[indKey], undefined) == this.getsmart(option, keys[indKey], undefined) && this.getsmart(list[i], keys[indKey], undefined) !== undefined) {
                if(indKey == keys.length-1){
                  return true
                }
              } else if(list[i] && typeof list[i] == 'string' && list[i] == this.getsmart(option, keys[indKey], undefined) && this.getsmart(option, keys[indKey], undefined) !== undefined){
                if(indKey == keys.length-1){
                  return true
                }
              }   
            } 
          }
        }
      }
      return false
    },
    thingIn({option, list=this.getsmart(objList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype, strings, retIndex}={}) {
      if(typeof option === 'object'){
        obj = true
      }
      if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
        if(retIndex){
          return list.indexOf(option)
        } else {
          return true
        }
      } else if (obj && list) {
        for (var i=0; i < list.length; i++) {
          for(var indKey=0; indKey<keys.length;indKey++){
            if(keymatchtype == 'broad'){
              if (list[i] && this.getsmart(list[i], keys[indKey], undefined) == this.getsmart(option, keys[indKey], undefined) && this.getsmart(list[i], keys[indKey], undefined) !== undefined) {
                if(retIndex){
                  return i
                } else {
                  return true
                }
              } else if(list[i] && typeof list[i] == 'string' && list[i] == this.getsmart(option, keys[indKey], undefined) && this.getsmart(option, keys[indKey], undefined) !== undefined){
                if(retIndex){
                  return i
                } else {
                  return true
                }
              }    
            } else {
              if (list[i] && this.getsmart(list[i], keys[indKey], undefined) == this.getsmart(option, keys[indKey], undefined) && this.getsmart(list[i], keys[indKey], undefined) !== undefined) {
                if(indKey == keys.length-1){
                  if(retIndex){
                    return i
                  } else {
                    return true
                  }
                }
              } else if(list[i] && typeof list[i] == 'string' && list[i] == this.getsmart(option, keys[indKey], undefined) && this.getsmart(option, keys[indKey], undefined) !== undefined){
                if(indKey == keys.length-1){
                  if(retIndex){
                    return i
                  } else {
                    return true
                  }
                }
              }  
            } 
          }
        }
      }
      if(retIndex){
        return -1
      } else {
        return false
      }
    },
    optsIn(options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      for (let option of options) {
        // if(typeof option === 'object'){
        //   obj = true
        // }
        if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
          // return true
        } else if (obj && list) {
          for (var i=0; i < list.length; i++) {
            if(!this.optIn(option, list[i], obj, keys, keymatchtype)){
              return false
            }
          }
        } else {
          return false
        }
      }
      return true
    },
    thingsIn({options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      for (let option of options) {
        // if(typeof option === 'object'){
        //   obj = true
        // }
        if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
          // return true
        } else if (obj && list) {
          for (var i=0; i < list.length; i++) {
            if(!this.optIn(option, list[i], obj, keys, keymatchtype)){
              return false
            }
          }
        } else {
          return false
        }
      }
      return true
    },
    anyOptsIn(options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      for (let option of options) {
        // if(typeof option === 'object'){
        //   obj = true
        // }
        if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
          return true
        } else if (obj && list) {
          for (var i=0; i < list.length; i++) {
            if(this.optIn(option, list[i], obj, keys, keymatchtype)){
              return true
            }
          }
        }
      }
      return false
    },
    anyThingsIn({options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      for (let option of options) {
        // if(typeof option === 'object'){
        //   obj = true
        // }
        if (!obj && list && list.indexOf && list.indexOf(option) >= 0) {
          return true
        } else if (obj && list) {
          for (var i=0; i < list.length; i++) {
            if(this.optIn(option, list[i], obj, keys, keymatchtype)){
              return true
            }
          }
        }
      }
      return false
    },
    optIndex(option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      if(typeof option === 'object'){
        obj = true
      }
      if (obj && list && keys) {
        for (var i=0; i < list.length; i++) {
          if(this.optIn(option, list, obj, keys, keymatchtype)){
            return i
          }
        }
      } else if(list) {
        return list.indexOf(option)
      }
      return -1
    },
    thingIndex({option, list, obj, keys=['uuid', '_id', 'id'], keymatchtype, strings}={}) {
      if(typeof option === 'object'){
        obj = true
      }
      if (obj && list && keys) {
        let index = this.thingIn({option, list, obj, keys, keymatchtype, strings, retIndex: true})
        return index
      } else if(list) {
        return list.indexOf(option)
      }
      return -1
    },
    pushOpt(option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      if (typeof list == 'object' && !this.optIn(option, list, obj, keys, keymatchtype)) {
        list.push(option)
      }
    },
    pushThing({option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      if (typeof list == 'object' && !this.optIn(option, list, obj, keys, keymatchtype)) {
        list.push(option)
      }
    },
    pushOpts(options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      for (let option of options) {
        this.pushOpt(option, list, obj, keys, keymatchtype)
      }
    },
    pushThings({options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      for (let option of options) {
        this.pushOpt(option, list, obj, keys, keymatchtype)
      }
    },
    popOpt(option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      if (typeof list == 'object' && this.optIn(option, list, obj, keys, keymatchtype)) {
        list.splice(this.optIndex(option, list, obj, keys, keymatchtype), 1)
      }
    },
    popThing({option, list=this.getsmart(stringList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      if (typeof list == 'object' && this.thingIn({option, list, obj, keys, keymatchtype})) {
        list.splice(this.thingIndex({option, list, obj, keys, keymatchtype}), 1)
      }
    },
    popOpts(options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      for (let option of options) {
        this.popOpt(option, list, obj, keys, keymatchtype)
      }
    },
    popThings({options, list=this.getsmart(stringList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      for (let option of options) {
        this.popOpt(option, list, obj, keys, keymatchtype)
      }
    },
    toggleOpt(option, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      if (this.optIn(option, list, obj, keys, keymatchtype)) {
        this.popOpt(option, list, obj, keys, keymatchtype)
      } else {
        this.pushOpt(option, list, obj, keys, keymatchtype)
      }
    },
    toggleThing({option, list=this.getsmart(stringList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      if (this.optIn(option, list, obj, keys, keymatchtype)) {
        this.popOpt(option, list, obj, keys, keymatchtype)
      } else {
        this.pushOpt(option, list, obj, keys, keymatchtype)
      }
    },
    toggleOpts(options, list=this.getsmart(stringList), obj, keys=['uuid', '_id', 'id'], keymatchtype) {
      for (let option in options) {
        this.toggleOpt(option, list, obj, keys, keymatchtype)
      }
    },
    toggleThings({options, list=this.getsmart(stringList), obj=true, keys=['uuid', '_id', 'id'], keymatchtype}={}) {
      for (let option in options) {
        if (this.optIn(option, list, obj, keys, keymatchtype)) {
          this.popOpt(option, list, obj, keys, keymatchtype)
        } else {
          this.pushOpt(option, list, obj, keys, keymatchtype)
        }
      }
    },
    ratchetOpt(option, list, obj, keys=['uuid', '_id', 'id'], keymatchtype){
		},
		// find(obj, property, equals){
		// 	if(this.getsmart(obj, 'constructor', undefined) == Array){
		// 		for(var i=0; i<obj.length; i++){
		// 			find(obj[i], )
		// 		}
		// 	}
		// },
    getsmart(obj, property, defaultValue, context) {

      if(!property && obj && typeof obj == 'string'){
        property = obj.split(".")
        try {
          obj = eval(property[0])
        } catch (err) {
          // console.error(err)

          obj = property[0]
        }
        property = property.slice(1, property.length)
      }
      if(!property){
        if(context){
          return {
            value: defaultValue,
            undefined: true
          }
        } else {
          return defaultValue
        }
      }
      // If the property list is in dot notation, convert to array
      if (typeof property == "string") {
          property = property.split(".");
      } else if(this.getsmart(property, 'constructor', false) !== Array){
        if(context){
          return {
            value: defaultValue,
            undefined: true,
						err: 'properties path @property argument was not passed properly'
          }
        } else {
          return defaultValue
        }
      }

      // In order to avoid constantly checking the type of the property
      // we separate the real logic out into an inner function.
      var deepGetByArray = function (obj, propsArray, defaultValue) {
          // If we have reached an undefined/null property
          // then stop executing and return the default value.
          // If no default was provided it will be undefined.
          if (!propsArray || (!obj && !(obj == 0 || obj == ''))) {
            if(context){
              return {
                value: defaultValue,
                undefined: true
              }
            } else {
              return defaultValue
            }
          }

          // If the path array has no more elements, we've reached
          // the intended property and return its value
          if (propsArray.length === 0) {
            if(context){
              return {
                value: obj,
                undefined: false
              }
            } else {
              return obj
            }
          }

          // Prepare our found property and path array for recursion
          var nextObj = obj[propsArray[0]];
          var remainingProps = propsArray.slice(1);

          return deepGetByArray(nextObj, remainingProps, defaultValue);
      };
      return deepGetByArray(obj, property, defaultValue);
    },
    setsmart(obj, property, value, context){
      if(!property && typeof obj == 'string'){
        property = obj.split(".")
        try {
          obj = eval(property[0])
        } catch (err) {
          // console.error(err)
          obj = property[0]
        }
        property = property.slice(1, property.length)
      }
      // If the property list is in dot notation, convert to array
      if (typeof property == "string") {
          property = property.split(".");
      } else if(this.getsmart(property, 'constructor', false) !== Array){
        if(context){
					return {
						value: value,
						undefined: true,
						err: 'properties path @property argument was not passed properly'
					}
				} else {
					return value
				}
      }

      // switch contexts
      var that = this
      // In order to avoid constantly checking the type of the property
      // we separate the real logic out into an inner function.
      var deepGetByArray = function (obj, propsArray, value) {
        
        // If the path array has only 1 more element, we've reached
        // the intended property and set its value
        if (propsArray.length == 1) {
          if(that.getsmart(vue, 'reactiveSetter', false) && that.$set){
            that.$set(obj, propsArray[0], value)
          } else {
            obj[propsArray[0]] = value
					}
					if(context){
						return {
							value: obj[propsArray[0]],
							undefined: false
						}
					} else {
						return obj[propsArray[0]]
					}
        }
        // Prepare our path array for recursion
        var remainingProps = propsArray.slice(1)
        if (obj[propsArray[0]] == undefined){
          // If we have reached an undefined/null property
          if(that.getsmart(vue, 'reactiveSetter', false) && that.$set){
            that.$set(obj, propsArray[0], {})
          } else {
            obj[propsArray[0]] = {}
          }
        }
        
        return deepGetByArray(obj[propsArray[0]], remainingProps, value)
      }
      if(property){
        return deepGetByArray(obj, property, value)
      } else {
				if(that.getsmart(vue, 'reactiveSetter', false) && that.$set){
					that.$set(obj, undefined, value)
				} else {
					obj = value
				}
				if(context){
					return {
						value: obj,
						undefined: false,
						err: 'there were no properties passed'
					}
				} else {
					return obj
				}
      }
    },
    gosmart(obj, property, value, context){
      // stands for get or set smart
      var get = this.getsmart(obj, property, value, true)
      if(get.undefined){
        get = this.setsmart(obj, property, get.value, context)
      }
      // return value from property path, either gotten or smartly set
      if(context){
        return get
      } else {
        return this.getsmart(get, 'value', get)
      }        

    },
    getsmartval(obj, property, defaultValue){
      // get the value of a property path based off its type
      let target = this.getsmart(obj, property, defaultValue)
      if(target && target.type){
        if(target[target.type]){
          return target[target.type]
        } else {
          return defaultValue
        }
      } else if(target) {
        return target
      }
      return defaultValue
    },
    safestring(something) {
      return this.jsmart.stringify(something || '')
    },
    safeparse(something) {
      return this.jsmart.parse(something || '')
    },
    mapsmart(list, keyProperty='title', returnExistant, populate){
      return new Promise((resolve, reject)=>{
        if(!keyProperty){
          reject()
        } else if (list) {
          if(list.length == 0){
            if((returnExistant && this.getsmart(list, 'mapped.'+returnExistant, false)) || !returnExistant){
              resolve(true)
            } else if(returnExistant) {
              resolve(false)
            } else {
              resolve()
            }
          }
          if(!list.mapped || typeof list.mapped === 'boolean'){
            if(this.getsmart(vue, 'reactiveSetter', false) && this.$set){
              this.$set(list, 'mapped', {})
            } else {
              list['mapped'] = {}
            }
          }
          for(var i=0;i<list.length;i++){
            if(typeof list[i] !== 'string'){
              if(this.getsmart(vue, 'reactiveSetter', false) && this.$set){
                this.$set(list.mapped, list[i][keyProperty], list[i])
              } else {
                list['mapped'][list[i][keyProperty]] = list[i]
              }
              if(i==list.length-1){
                if((returnExistant && this.getsmart(list, 'mapped.'+returnExistant, false)) || !returnExistant){
                  resolve(true)
                } else if(returnExistant) {
                  resolve(false)
                } else {
                  resolve()
                }
              }
            } 
            // else if(populate){
            //   var funCounter = this.funCounter
            //   this.funCounter = this.funCounter + 1
            //   this.getThing({
            //     thing: list[i],
            //     clientId: this._uid,
            //     funCounter
            //   })
            //   this.$options.sockets['giveThing'] = data => {
            //     if(this._uid == data.clientId && data.funCounter == funCounter){
            //       this.$set(list, i.toString(), data.thing)
            //       this.$set(list.mapped, list[i][keyProperty], list[i])
            //     }
            //     if(i==list.length-1){
            //       if((returnExistant && this.getsmart(list, 'mapped.'+returnExistant, false)) || !returnExistant){
            //         resolve(true)
            //       } else if(returnExistant) {
            //         resolve(false)
            //       } else {
            //         resolve()
            //       }
            //     }
            //   } 
            // } 
            else if(i==list.length-1) {
              if((returnExistant && this.getsmart(list, 'mapped.'+returnExistant, false)) || !returnExistant){
                resolve(true)
              } else if(returnExistant) {
                resolve(false)
              } else {
                resolve()
              }
            }
          }
          // if(list.mapped && !list.mapped['agora-client-mapped']){
          //   this.$set(list.mapped, 'agora-client-mapped', true)
          // }

        }
      })
		},
		
    domval(thing){
      return this.getsmart(thing, 'properties.description', '')
    }
  }
}

