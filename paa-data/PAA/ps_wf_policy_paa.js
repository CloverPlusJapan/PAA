/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect','N/task','N/record'], function(runtime, search, redirect,task,record) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
	
	
    function onAction(scriptContext) {
    	var currentRecord = scriptContext.newRecord;	
    	var script = runtime.getCurrentScript();
    	var policyId = currentRecord.id;														//稟議ID
    	var policyType = script.getParameter({name: "custscript_ns_policy_screen_type"});		//稟議申請承認チェック
		if(!isEmpty(policyId)){
       		//施策運用稟議画面
		    var policyRecord = record.load({
			    type: 'customrecord_ns_policy_screen',
			    id: policyId,
			    isDynamic: true
			});
		    //NS_予算ID
		    var budgetIdArr = policyRecord.getValue({fieldId : 'custrecord_ns_policy_budget_id'});
		    if(!isEmpty(budgetIdArr)){
		    	var budgetValue = budgetIdArr.split(',');
		    	//NS_予算_新規 検索
	    		var searchType = "customrecord_ringi_budget_new";
	    		var searchFilters = [];
	    		searchFilters.push(["internalid",'anyof',budgetValue]);
    		    var searchColumns = [search.createColumn({
    	            name : "custrecord_ns_new_budget_8_residual",
    	            label : "8月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_9_residual",
    	            label : "9月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_10_residual",
    	            label : "10月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_11_residual",
    	            label : "11月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_12_residual",
    	            label : "12月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_1_residual",
    	            label : "1月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_2_residual",
    	            label : "2月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_3_residual",
    	            label : "3月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_4_residual",
    	            label : "4月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_5_residual",
    	            label : "5月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_6_residual",
    	            label : "6月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_7_residual",
    	            label : "7月予算残額"
    		    }),search.createColumn({
    	            name : "internalid",
    	            label : "内部ID"
    		    })];
    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
    		    if (searchResults && searchResults.length > 0) {
    		    	 var infoDic = {};
    		    	 for (var i = 0; i < searchResults.length; i++) {
    		    		 var tmpResult = searchResults[i];
    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8月予算残額
    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9月予算残額
    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10月予算残額
    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11月予算残額
    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12月予算残額
    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1月予算残額
    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2月予算残額
    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3月予算残額
    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4月予算残額
    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5月予算残額
    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6月予算残額
    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7月予算残額 
    		    		 var key = tmpResult.getValue(searchColumns[12]);//内部ID
    		    		 
 		                 var ValueArr = new Array();
 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount]);
 		                 infoDic[key] = new Array();
 		                 infoDic[key].push(ValueArr);
    		    	 }
    		    }
    			var generalMessage = '';//通常
    			var compenMessage = '';//減価償却
    			var policyArr = new Array();
    			var policyLine = policyRecord.getLineCount('recmachcustrecord_ns_policy_screen');
    			for(var i = 0 ; i < policyLine ; i++){
    		    	//NS_予算
    	        	var budgetId = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
    	        	//8月
    	        	var augAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
    	        	//9月
    	        	var sepAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
    	        	//10月
    	        	var octAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
    	        	//11月
    	        	var novAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
    	        	//12月
    	        	var decAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
    	        	//1月
    	        	var janAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
    	        	//2月
    	        	var febAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
    	        	//3月
    	        	var marAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
    	        	//4月
    	        	var aprAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
    	        	//5月
    	        	var mayAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
    	        	//6月
    	        	var junAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
    	        	//7月
    	        	var julAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
    	        	//来期以降総額
    	        	var mounth = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount',line: i});
    	        	//取得金額
    	        	var amount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_money',line: i});
    	        	//NS_稟議リスト
    	        	var policyList = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_list',line: i});
    	        	//現在のq 1
        			var q1Amount = Number(augAmount) + Number(sepAmount) + Number(octAmount);
        			//現在のq 2
        			var q2Amount = Number(novAmount) + Number(decAmount) + Number(janAmount);
        			//現在のq 3
        			var q3Amount = Number(febAmount) + Number(marAmount) + Number(aprAmount);
        			//現在のq 4
        			var q4Amount = Number(mayAmount) + Number(junAmount) + Number(julAmount);
        			//現在の金額
        			var totalValue = Number(augAmount)+Number(sepAmount)+Number(octAmount)+Number(novAmount)+Number(decAmount)+Number(janAmount)+Number(febAmount)+Number(marAmount)+Number(aprAmount)+Number(mayAmount)+Number(junAmount)+Number(julAmount);
        			//NS_予算_新規 残額 
        			var residueAmount = infoDic[budgetId];
        			if(!isEmpty(residueAmount)){
    					var	augValue = residueAmount[0][0][0];//8月予算残額
    					var	sepValue = residueAmount[0][1][0];//9月予算残額
    					var	octValue = residueAmount[0][2][0];//10月予算残額
    					var	novValue = residueAmount[0][3][0];//11月予算残額
    					var	decValue = residueAmount[0][4][0];//12月予算残額
    					var	janValue = residueAmount[0][5][0];//1月予算残額
    					var	febValue = residueAmount[0][6][0];//2月予算残額
    					var	marValue = residueAmount[0][7][0];//3月予算残額
    					var	aprValue = residueAmount[0][8][0];//4月予算残額
    					var	mayValue = residueAmount[0][9][0];//5月予算残額
    					var	junValue = residueAmount[0][10][0];//6月予算残額
    					var	julValue = residueAmount[0][11][0];//7月予算残額
    					var	q1Value = Number(augValue) + Number(sepValue) + Number(octValue);//Q1予算残額 
    					var	q2Value = Number(novValue) + Number(decValue) + Number(janValue);//Q2予算残額 
    					var	q3Value = Number(febValue) + Number(marValue) + Number(aprValue);//Q3予算残額 
    					var	q4Value = Number(mayValue) + Number(junValue) + Number(julValue);//Q4予算残額 

    					var newAugValue = Number(augValue) - Number(augAmount);//新8月予算残額
    					var newSepValue = Number(sepValue) - Number(sepAmount);//新9月予算残額
    					var newOctValue = Number(octValue) - Number(octAmount);//新10月予算残額
    					var newNovValue = Number(novValue) - Number(novAmount);//新11月予算残額
    					var newDecValue = Number(decValue) - Number(decAmount);//新12月予算残額
    					var newJanValue = Number(janValue) - Number(janAmount);//新1月予算残額
    					var newFebValue = Number(febValue) - Number(febAmount);//新2月予算残額
    					var newMarValue = Number(marValue) - Number(marAmount);//新3月予算残額
    					var newAprValue = Number(aprValue) - Number(aprAmount);//新4月予算残額
    					var newMayValue = Number(mayValue) - Number(mayAmount);//新5月予算残額
    					var newJunValue = Number(junValue) - Number(junAmount);//新6月予算残額
    					var newJulValue = Number(julValue) - Number(julAmount);//新7月予算残額  
        			}        		
        			
        			policyArr.push({
        				budgetId:budgetId,
        				newAugValue:newAugValue,
        				newSepValue:newSepValue,
        				newOctValue:newOctValue,
        				newNovValue:newNovValue,
        				newDecValue:newDecValue,
        				newJanValue:newJanValue,
        				newFebValue:newFebValue,
        				newMarValue:newMarValue,
        				newAprValue:newAprValue,
        				newMayValue:newMayValue,
        				newJunValue:newJunValue,
        				newJulValue:newJulValue,
        			});
        			
        			if(policyType == 'apply'){
        				if(policyList == '1'){
            				if(Number(q1Amount) > Number(q1Value)){
            					generalMessage += i+1+"行目がQ1予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(q2Amount) > Number(q2Value)){
            					generalMessage += i+1+"行目がQ2予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(q3Amount) > Number(q3Value)){
            					generalMessage += i+1+"行目がQ3予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(q4Amount) > Number(q4Value)){
            					generalMessage += i+1+"行目がQ4予算を超えています。再入力してください。"+'\n';
            				}  
        				}else if(policyList == '3'){
        					var getAmount = totalValue + Number(mounth);
            				if(Number(getAmount) > Number(amount)){
            					compenMessage += i+1+"行目が今期＋来期以降総額は取得金額以下でなければなりません。"+'\n';
            				}           				
            				if(Number(augAmount) > Number(augValue)){
            					compenMessage += i+1+"行目が8月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(sepAmount) > Number(sepValue)){
            					compenMessage += i+1+"行目が9月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(octAmount) > Number(octValue)){
            					compenMessage += i+1+"行目が10月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(novAmount) > Number(novValue)){
            					compenMessage += i+1+"行目が11月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(decAmount) > Number(decValue)){
            					compenMessage += i+1+"行目が12月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(janAmount) > Number(janValue)){
            					compenMessage += i+1+"行目が1月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(febAmount) > Number(febValue)){
            					compenMessage += i+1+"行目が2月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(marAmount) > Number(marValue)){
            					compenMessage += i+1+"行目が3月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(aprAmount) > Number(aprValue)){
            					compenMessage += i+1+"行目が4月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(mayAmount) > Number(mayValue)){
            					compenMessage += i+1+"行目が5月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(junAmount) > Number(junValue)){
            					compenMessage += i+1+"行目が6月予算を超えています。再入力してください。"+'\n';
            				}
            				if(Number(julAmount) > Number(julValue)){
            					compenMessage += i+1+"行目が7月予算を超えています。再入力してください。"+'\n';
            				}
        				}
        			}
    			} 
    			

    			
    			//申請 
    			if(policyType == 'apply'){
    				if(!isEmpty(compenMessage) || !isEmpty(generalMessage)){
    					var errorMessage = (compenMessage+ '</br>' + generalMessage)
    					throw errorMessage;
    				}
       			//承認
    			}else if(policyType == 'recognize'){
    				if (policyArr.length > 0){ 	
    					for(var j = 0; j < policyArr.length; j++){
    						var budgetId = policyArr[j].budgetId;
    						var newAugValue = policyArr[j].newAugValue;
    						var newSepValue = policyArr[j].newSepValue;
    						var newOctValue = policyArr[j].newOctValue;
    						var newNovValue = policyArr[j].newNovValue;
    						var newDecValue = policyArr[j].newDecValue;
    						var newJanValue = policyArr[j].newJanValue;
    						var newFebValue = policyArr[j].newFebValue;
    						var newMarValue = policyArr[j].newMarValue;
    						var newAprValue = policyArr[j].newAprValue;
    						var newMayValue = policyArr[j].newMayValue;
    						var newJunValue = policyArr[j].newJunValue;
    						var newJulValue = policyArr[j].newJulValue;
    	    				//更新8月予算残額
    						if(!isEmpty(newAugValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_8_residual': newAugValue}});
    						} 					
    						//更新9月予算残額
    						if(!isEmpty(newSepValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_9_residual': newSepValue}});
    						}
    						//更新10月予算残額
    						if(!isEmpty(newOctValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_10_residual': newOctValue}});
    						}
    						//更新11月予算残額
    						if(!isEmpty(newNovValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_11_residual': newNovValue}});
    						}
    						//更新12月予算残額
    						if(!isEmpty(newDecValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_12_residual': newDecValue}});
    						}
    						//更新1月予算残額
    						if(!isEmpty(newJanValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_1_residual': newJanValue}});
    						}
    						//更新2月予算残額
    						if(!isEmpty(newFebValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_2_residual': newFebValue}});
    						}
    						//更新3月予算残額
    						if(!isEmpty(newMarValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_3_residual': newMarValue}});
    						}
    						//更新4月予算残額
    						if(!isEmpty(newAprValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_4_residual': newAprValue}});
    						}
    						//更新5月予算残額
    						if(!isEmpty(newMayValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_5_residual': newMayValue}});
    						}
    						//更新6月予算残額
    						if(!isEmpty(newJunValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_6_residual': newJunValue}});
    						}
    						//更新7月予算残額
    						if(!isEmpty(newJulValue)){
    	   	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_7_residual': newJulValue}});
    						}

    					}			   					
    				}
    			}
		    }
		}
    }
    
    
	function createSearch(searchType, searchFilters, searchColumns) {

	        var resultList = [];
	        var resultIndex = 0;
	        var resultStep = 1000;

	        var objSearch = search.create({
	            type : searchType,
	            filters : searchFilters,
	            columns : searchColumns
	        });
	        var objResultSet = objSearch.run();

	        do {
	            var results = objResultSet.getRange({
	                start : resultIndex,
	                end : resultIndex + resultStep
	            });

	            if (results.length > 0) {
	                resultList = resultList.concat(results);
	                resultIndex = resultIndex + resultStep;
	            }
	        } while (results.length == 1000);

	        return resultList;
	 }
	 
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
    
	
    return {
        onAction : onAction
    };
    
});
