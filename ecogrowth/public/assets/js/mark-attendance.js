//Play Audio Thank You
function playAudio() { 
	var x = document.getElementById("myAudio"); 
	x.play(); 
	setTimeout(function(){
		window.location.reload();
	}, 3000);
}

//Play Audio Sorry
function playAudioSorry() {
	var x = document.getElementById("myAudioSorry"); 
	x.play(); 
	setTimeout(function(){
		window.location.reload();
	}, 3000);
}



function tempAlert(msg,duration)
{
	var el = document.createElement("div");
	el.setAttribute("style","height:150px;width:350px;position:absolute;top:25%;left:35%;background-color:#c7bbbb;padding:30px;border:1px solid;");
	el.innerHTML = msg;
	setTimeout(function(){
		el.parentNode.removeChild(el);
	},duration);
	document.body.appendChild(el);
}

function tempAlertError(msg,duration)
{
	var el = document.createElement("div");
	el.setAttribute("style","height:150px;width:350px;position:absolute;top:25%;left:35%;background-color:#900909;padding:30px;border:1px solid;text-align:center;color:white;");
	el.innerHTML = msg;
	setTimeout(function(){
		el.parentNode.removeChild(el);
	},duration);
	document.body.appendChild(el);
}

function gatePassAlertError(msg,duration)
{
	var el = document.createElement("div");
	el.setAttribute("style","height:150px;width:350px;position:absolute;top:25%;left:35%;background-color:#900909;padding:30px;border:1px solid;text-align:center;color:white;");
	el.innerHTML = msg;
	setTimeout(function(){
		el.parentNode.removeChild(el);
	},duration);
	document.body.appendChild(el);
}

function Match(status,employee_id) {
	var quality = 60; 
	var timeout = 10; 
	try {
		var resultData =1;
		var res = CaptureFinger();
		if (res.httpStaus) {
			if (res.data.ErrorCode == "0") {
				var isoTemplateDataLocal =  res.data.IsoTemplate;
				$.ajax({
					type: "GET",
					url: '/attendance/get-employee-data/employee_id/'+employee_id,
					success: function (data) {
						// console.log(data);
						var today = new Date();
						var currMonth = today.getMonth()+1;
						var curr_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
						var curr_date = today.getFullYear() + "-" + currMonth + "-" + today.getDate() + ' '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
						var curr_date_gate = today.getFullYear() + "-" + currMonth + "-" + today.getDate();
						if(status==1){
							var employeeFinger = [data.finger_iso_1, data.finger_iso_2, data.finger_iso_3, data.finger_iso_4, data.finger_iso_5];
							var dataCnt = employeeFinger.length;
							for(var i=0; i<dataCnt; i++){
								var isoTemplateDataServer = employeeFinger[i];
								if(isoTemplateDataServer!=''){
									var res = VerifyFinger(isoTemplateDataServer, isoTemplateDataLocal);
									if (res.httpStaus) {
										if (res.data.Status==true) {
											alert();
											$.ajax({
												type: "GET",
												url: '/attendance/mark-attendance/id/'+data.id+'/status/'+status,
												beforeSend: function() {

												},
												success: function (data2) {
													console.log(data2);
													return false;
													var strdata = 'Employee Name : '+data2.name;
													tempAlert(strdata,3000);
													playAudio();

												},
												error: function (jqXHR, ajaxOptions, thrownError) {
													alert(getHttpError(jqXHR));
												},
											});
											i=dataCnt+2;
										}
									}
								}
							}
							
						}else{

							var employeeFinger = [data.finger_iso_1, data.finger_iso_2, data.finger_iso_3, data.finger_iso_4, data.finger_iso_5];
							var dataCnt = employeeFinger.length;
							for(var i=0; i<dataCnt; i++){
								var isoTemplateDataServer = employeeFinger[i];
								if(isoTemplateDataServer!=''){
									var res = VerifyFinger(isoTemplateDataServer, isoTemplateDataLocal);
									if (res.httpStaus) {
										if (res.data.Status==true) {
											$.ajax({
												type: "GET",
												url: '/attendance/mark-attendance/id/'+data.id+'/status/'+status,
												beforeSend: function() {
												},
												success: function (data2) {
													console.log(data2);
													var strdata = 'Employee Name : '+data2.name;
													tempAlert(strdata,3000);
													playAudio();
												},
												error: function (jqXHR, ajaxOptions, thrownError) {
													alert(getHttpError(jqXHR));
												},
											});
											i=dataCnt+2;
										}
									}
								}


							}

						}

						var dataCntCnf = dataCnt;
						if(i==dataCntCnf){
							var strdata = 'Please press finger again';
							tempAlertError(strdata,3000);
							playAudioSorry();

						}
					},
					error: function (jqXHR, ajaxOptions, thrownError) {
						alert(getHttpError(jqXHR));
					},
				});

			}

		}
		else {
			alert(res.err);
		}

	}
	catch (e) {
		alert(e);
	}

	return false;

}  




function getSeachData(val){
	console.log(val);
	if(val!=''){
		$.get( "/attendance/get-attendance/", { id: val }, "json" )
		.done(function( data ) {
			console.log(data);
			console.log(data.attendancedata);
			if(!data.userData){
				alert(data.attendancedata);
				document.getElementById("msg").innerHTML = "Invalid Employee Id";

			}else{

				if(data.attendancedata.status=='0'){
				}
				if(data.attendancedata.status=='1'){
				}
				if(!data.attendancedata){

				}   
			}      
		});
	}else{

		document.getElementById("msg").innerHTML = "";

	}
}

