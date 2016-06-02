import {Router} from 'express';

const provinces = ['浙江省', '北京市', '上海市'];
const taskIds = ['21232f297a57a5a743894a0e4a801fc3'];
const router = new Router();

router.post('/', (req, res) => {
  const {
    parter_code, parter_key, province, city_code,
    login_type, username, password, task_id,
  } = req.query;
  console.log(req.query);
  if (parter_code == 'demo1' && parter_key == '21232f297a57a5a743894a0e4a801fc3') {
    if (!provinces.find(item => item == province)) {
      res.json({
        success: false,
        reason_code: 501,
        reason_desc: '不支持该地区的公积金登录'
      });
      return;
    }

    res.json({
      success: true,
      task_id: '21232f297a57a5a743894a0e4a801fc3'
    });
    return;
  }

  if (task_id) {
    if (!taskIds.find(item => item == task_id)) {
      res.json({
        success: false,
        reason_code: '404',
        reason_desc: '找不到资源'
      });
      return;
    }

    res.json({
      success: true,
      task_id: '21232f297a57a5a743894a0e4a801fc3'
    });
    return;
  }

  res.json({
    success: false,
    reason_code: '400',
    reason_desc: '服务暂时不可用'
  });
});

module.exports = router;
