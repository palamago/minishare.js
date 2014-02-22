var MiniShare;

;(function(w, d){

    "use strict";

    var gapi = {};

    MiniShare = w.MiniShare = w.MiniShare || {};

    MiniShare.buttons = {
        'tw' : [],
        'fb' : [],
        'gp' : []
    };

    MiniShare.actions = {
        'tw' : undefined,
        'fb' : undefined,
        'gp' : undefined
    };

    MiniShare.utils = {
        extend : function(){
            for(var i=1; i<arguments.length; i++)
                for(var key in arguments[i])
                    if(arguments[i].hasOwnProperty(key))
                        arguments[0][key] = arguments[i][key];
            return arguments[0];
        }, 
        getCurrentLocation: function(type){
            return w.location.href;
        },
        param: function(data) {
            return Object.keys(data).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
            }).join('&')
        },
        getSize: function() {
          var myWidth = 0, myHeight = 0;
          if( typeof( window.innerWidth ) == 'number' ) {
            //Non-IE
            myWidth = window.innerWidth;
            myHeight = window.innerHeight;
          } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
            //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
            myHeight = document.documentElement.clientHeight;
          } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
            //IE 4 compatible
            myWidth = document.body.clientWidth;
            myHeight = document.body.clientHeight;
          }
          return {width:myWidth,height:myHeight};
        }
    }

    MiniShare.options = {
        fb:{
            title:'Take a look!',
            text:'Take a look in my awesome site!',
            img: ''
        },
        tw:{
            text:'Take a look in my awesome site!',
            related : '',
            ht: '',
            via:''
        },
        em:{
            subject:'Take a look!',
            body:'Take a look in my awesome site!'
        },
        shortener:{
                enabled:false,
                google_api_key:undefined
            },
        getUrl: MiniShare.utils.getCurrentLocation
    };

    MiniShare.init = function(opts){
        this.utils.extend(MiniShare.options,opts);
        
        MiniShare.buttons = {
            'tw' : d.querySelectorAll('.minishare-tw'),
            'fb' : d.querySelectorAll('.minishare-fb'),
            'gp' : d.querySelectorAll('.minishare-gp')
        };

        for (var s in MiniShare.buttons){
            for(var i = 0; i < MiniShare.buttons[s].length;i++) {
              MiniShare.buttons[s][i].addEventListener('click',MiniShare.actions[s], false);
            }
        }

        if(MiniShare.options.shortener.enabled && gapi){
            //Get your own Browser API Key from  https://code.google.com/apis/console/
            gapi.client.setApiKey(MiniShare.options.shortener.google_api_key);
            gapi.client.load('urlshortener', 'v1',function(){
                //console.log('cargo');
            });
        }
    }

    MiniShare.openWindow = function(url,title){
        var size = MiniShare.utils.getSize();
        var width  = 575,
            height = 400,
            left   = (size.width  - width)  / 2,
            top    = (size.height - height) / 2,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, title, opts);

        return false;
    }

    MiniShare.getUrl =  function(type,callback){
        var url = MiniShare.options.getUrl(type);
        if(MiniShare.options.shortener.enabled){
            MiniShare.shortUrl(url,function(shortUrl){
                callback(shortUrl);
            });
        }else{
            callback(url);
        }
    }

    MiniShare.shortUrl =  function(url,callback){
        var longUrl = url;
        var request = gapi.client.urlshortener.url.insert({
            'resource': {
              'longUrl': longUrl
            }
        });
        request.execute(function(response){
            if(response.id != null) {
                callback(response.id);
            } else {
                alert("Error al compartir, por favor intente más tarde.");
                if(console)
                    console.error(response.error);
            }
        });
    }

    MiniShare.actions.tw = function(){
        var qObj = {
            'text': MiniShare.options.tw.text,
            'related': MiniShare.options.tw.related,
            'hashtags': MiniShare.options.tw.ht,
            'url': '',
            'via': MiniShare.options.tw.via
        };

        MiniShare.getUrl('twitter',function(url){
            MiniShare.completeInfo('Twitter',qObj,'url',url,"https://twitter.com/intent/tweet?");
        });

        return false;
    }

    MiniShare.actions.fb = function(){
        var qObj = {
            'u' : ''
        }

        MiniShare.getUrl('facebook',function(url){
            MiniShare.completeInfo('Facebook',qObj,'u',url,"http://www.facebook.com/sharer/sharer.php?");
        });

        return false;
    }

    MiniShare.actions.gp = function(){
        var qObj = {
            'url' : ''
        }

        MiniShare.getUrl('google+',function(url){
            MiniShare.completeInfo('Google+',qObj,'url',url,"https://plus.google.com/share?");
        });

        return false;
    }

    MiniShare.completeInfo = function(title,qObj,key,url,shareUrl){
        qObj[key] = url;
        var qs = MiniShare.utils.param(qObj);
        MiniShare.openWindow(shareUrl+qs,title);
    }

   /* MiniShare.shareMail = function(e){

        var qObj = {
            'subject': MiniShare.options.em.subject,
            'body': MiniShare.options.em.body
        };

        function cb(url){
            qObj.body += ' - ' + url;
            var qs = $.param(qObj).replace(/\+/g,' ');
            var href = "mailto:?" + qs;
            window.location = href;
        }

        MiniShare.getUrl('email',cb);

        return false;
    }*/


})(window, document);