
gaTrack = {} ;

gaTrack.trackStart = function(trackObj){
	
	
    if(trackObj && trackObj.accId)
    {
        //creating global gaq object
    	
    	  window._gaq = window._gaq || [];	
        
    	 _gaq.push(['_setAccount', trackObj.accId]);        

    	 
    	 if(trackObj.domain){
        	
    		 _gaq.push(['_setDomainName',trackObj.domain ]);
     	}
     	if(trackObj.allowLink)
        {
     		
     		 _gaq.push(['_setAllowLinker', trackObj.allowLink]);
     	}
     	
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
 	
     	
   	}
  
};

gaTrack.trackPage = function(pageObj){
   	
    	if(pageObj && pageObj.pageUrl)
    		{
    		    _gaq.push(['_trackPageview', pageObj.pageUrl]);     			    		
    		}
       else {
    		
    		_gaq.push(['_trackPageview']);  
    		    	    
    	    }
		
};


gaTrack.trackEvent = function(eventObj){
	
	
     if(eventObj &&eventObj.category&&eventObj.action)
     {
    	    _gaq.push(['_trackEvent', eventObj.category, eventObj.action,eventObj.label||'', eventObj.value||'',eventObj.nonIntxn||'']);
    		 
     }
	
};

gaTrack.disableTracking = function(trackObj){
    	
    	if(trackObj && trackObj.accId)
    		{
    		
    		   window['ga-disable-'+trackObj.accId] = true;    		  
    		
    		}
  
		
};
gaTrack.enableTracking = function(trackObj){

	if(trackObj && trackObj.accId)
		{		  
		  		
		   window['ga-disable-'+trackObj.accId] = false;
		
		}

	
};

