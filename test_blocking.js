


		setTimeout(function() {
		console.log("world");
		},2000)
		
		console.log("hello");
		
		function foo() {
		return 1+2;
		}
		console.log(foo());
		
		
		
	 	var wait_ = function (){
		for(i=0 ; i< 50;i++){
		setTimeout(function() {
		console.log("___hello");
		},4000)
		}
		}
		
		 var i=0;
		for(j=0;j<1;j++){
		wait_();
		}
		
		wait_();