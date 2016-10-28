phonon.options({
    navigator: {
        defaultPage: 'home',
        animatePages: true,
        templateRootDirectory: 'views/',
        enableBrowserBackButton: true,
        useHash: true
    },
    i18n: {
        directory: 'langs/',
        localeFallback: 'en'
    }
});

var language = localStorage.getItem('language') || (window.navigator.userLanguage || window.navigator.language).split('-')[0];
phonon.updateLocale(language);

var selectedAlarm = {};

phonon.navigator().on({page: 'home', content: 'home.html', preventClose: false, readyDelay: 0}, function(activity) {

    activity.onReady(function () {
      var ul = document.getElementById('list');
      var alarms = JSON.parse(localStorage.getItem('alarms'));

      while (ul.firstChild) {
          ul.removeChild(ul.firstChild);
      }

      if (Array.isArray(alarms)) {
        document.getElementById('no-alarm').style.display = 'none';
        phonon.i18n().get('available_alarm', function (value) {
          var title = document.createElement('li');
          title.appendChild(document.createTextNode(value));
          title.className += 'divider';
          ul.appendChild(title);
          alarms.forEach(function (alarm, index) {
            var li = document.createElement('li');

            // Delete alarm button
            var deleteBtn = document.createElement('a');
            deleteBtn.on('click', function () {
              phonon.i18n().get(['question_sure', 'warning', 'ok', 'cancel'], function(values) {
                 var confirm = phonon.confirm(values['question_sure'], values['warning'], true, values['ok'], values['cancel']);
                 confirm.on('confirm', function() {
                   alarms.splice(index, 1);
                   localStorage.setItem('alarms', JSON.stringify(alarms));
                   ul.removeChild(li);
                 });
               });
            });
            deleteBtn.className += 'pull-right icon icon-close';
            li.appendChild(deleteBtn);

            // Select alarm button
            var selectBtn = document.createElement('a');
            selectBtn.appendChild(document.createTextNode(alarm.name));
            selectBtn.on('click', function () {
              selectedAlarm = alarm;
              phonon.navigator().changePage('toggle-alarm');
            });
            selectBtn.className += 'padded-list';
            li.appendChild(selectBtn);

            ul.appendChild(li);
          });
        });
      } else {
        document.getElementById('no-alarm').style.display = 'block';
      }

    });
});

phonon.navigator().on({page: 'add-alarm', content: 'add-alarm.html', preventClose: false, readyDelay: 0}, function(activity) {

    var iphConvertion = [
    	'?',
    	'>',
    	'=',
    	'<',
    	';',
    	':',
    	'9',
    	'8',
    	'7',
    	'6'
    ];

  activity.onCreate(function () {
    	var system = document.getElementById('system');
    	var phone = document.getElementById('number');
    	var password = document.getElementById('password');
    	var name = document.getElementById('name');
    	var passwordDiv = document.getElementById('password-div');
    	var systemDiv = document.getElementById('chose-system');
    	var informationsDiv = document.getElementById('fill-informations');
    	var continueBtn = document.getElementById('continue-btn');
    	var submitBtn = document.getElementById('submit-btn');
    	var alarm = {};
    	var alarms = JSON.parse(localStorage.getItem('alarms')) || [];

    	continueBtn.on('click', function () {
    		alarm.system = system.value;
    		informationsDiv.style.display = 'block';
    		systemDiv.style.display = 'none';

        if (alarm.system === 'custom') {
          passwordDiv.style.display = 'none';
        } else {
          passwordDiv.style.display = 'block';
        }
    	});

    	submitBtn.on('click', function () {
    		alarm.number = number.value;
    		alarm.password = password.value;
      	alarm.name = name.value;

        if (alarm.name === '') {
          alarm.name = alarm.length + 1;
        }

    		if (isNaN(alarm.number) && alarm.number.length < 7 && alarm.number.length > 13) {
    			return phonon.i18n().get(['number_not_standard', 'error', 'ok'], function(values) {
    				phonon.alert(values['number_not_standard'], values['error'], false, values['ok']);
    			});
    		}

    		if (alarm.system === 'iph') {
    			if (isNaN(alarm.password)) {
    				return phonon.i18n().get(['password_not_number', 'error', 'ok'], function(values) {
    					phonon.alert(values['password_not_number'], values['error'], false, values['ok']);
    				});
    			}

    			alarm.password = alarm.password.split('').map(function(digit) {
    				return iphConvertion[digit];
    			}).join('');

    			alarm.enable = alarm.password + 'N>';
    			alarm.disable = alarm.password + 'N=';

    			delete alarm.password;
    		}

    		alarms.push(alarm);

    		localStorage.setItem('alarms', JSON.stringify(alarms));
    		alarm = {};
    		number.value = '';
    		name.value = '';
    		password.value = '';
    		informationsDiv.style.display = 'none';
    		systemDiv.style.display = 'block';
    		phonon.navigator().changePage('home');
    	});
    });
});

phonon.navigator().on({ page: 'language', content: 'language.html', preventClose: false, readyDelay: 0 }, function (activity) {

    activity.onCreate(function () {
        var radios = document.querySelectorAll('input[name=language]');
        document.querySelector('#language-btn').on('click', function () {
            for (var i in radios) {
                if (radios[i].checked) {
                    localStorage.setItem('language', radios[i].value);
                    phonon.updateLocale(radios[i].value);
                    language = radios[i].value;
                    break;
                }
            }
            phonon.i18n().get(['language_confirm', 'information', 'ok'], function (values) {
                phonon.alert(values.language_confirm, values.information, false, values.ok);
            });
        });
    });

    activity.onReady(function () {
        var radios = document.querySelectorAll('input[name=language]');
        for (var i in radios) {
            if (radios[i].value == language) {
                radios[i].checked = true;
                break;
            }
        }
    });
});

phonon.navigator().on({ page: 'toggle-alarm', content: 'toggle-alarm.html', preventClose: false, readyDelay: 0 }, function (activity) {

    activity.onCreate(function () {
        document.getElementById('alarm-name').innerHTML = selectedAlarm.name;
        document.getElementById('alarm-system').innerHTML = selectedAlarm.system;

        var alertMessage = function (sentence, type) {
          phonon.i18n().get([sentence, type, 'ok'], function(values) {
            phonon.alert(values[sentence], values[type], false, values['ok']);
          });
        };

        var getPermission = function(cb) {
          cordova.plugins.permissions.hasPermission(cordova.plugins.permissions['SEND_SMS'], function (status) {
            if(!status.hasPermission) {
                cordova.plugins.permissions.requestPermission(cordova.plugins.permissions['SEND_SMS'], function (status) {
                    if(!status.hasPermission) return alertMessage('not_allowed_to_send_sms', 'error');
                    cb();
                }, function() {
                    alertMessage('not_allowed_to_send_sms', 'error')
                });
            } else {
              cb();
            }
          }, null);
        };

        var sendSMS = function (text, cb) {
          getPermission(function() {
            SMS.sendSMS(selectedAlarm.number, text, cb, cb);
          });
        }

        document.getElementById('lock-btn').on('click', function () {
          sendSMS(selectedAlarm.enable, function () {
            alertMessage('alarm_enabled', 'information');
          });
        });

        document.getElementById('unlock-btn').on('click', function () {
          sendSMS(selectedAlarm.disable, function () {
            alertMessage('alarm_disabled', 'information');
          });
        });
    });
});


phonon.i18n().bind();
phonon.navigator().start();
