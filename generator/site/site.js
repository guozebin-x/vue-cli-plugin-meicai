let siteOptions = {
  // 是否启用埋点.
  isTrackUser: true,
  // 若启用埋点，则需要配置初始化选项.
  trackerOptions: {
    env: location.href.includes('https://sso.yunshanmeicai.com') ? 'production' : 'stage',
    autoPilot: true,
    routeMap:{
      '#/': {
        pageId: 3386,
        url: '/#/'
      },
      '#/personal/account': {
        pageId: 3387,
        url: '/#/personal/account'
      }
    },
    routePathName: window.location.pathname, //pathName前缀
    routeUrlPrefix:'https://sso.yunshanmeicai.com'
  },
  baseParam: {
    uid:'1',//用户id
    device_id:randomDeviceId(),//设备id
    net:"wifi",
    app_version:'0.1.0',
    app_system:"web",
    app_runtime:'native',
    app_id: 28,
    latitude:'',
    longitude:''
  }
}
  function randomDeviceId(){
    var result = ""; 
    if(localStorage.getItem("device_id")){
      result = localStorage.getItem("device_id");
    }else{
      var data = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
      for(var i = 0;i < 20;i++){
        let r = Math.floor(Math.random()*16);
        result+= data[r]; 
      }
      localStorage.setItem("device_id",result);
    }
    return result;
  }


export default siteOptions