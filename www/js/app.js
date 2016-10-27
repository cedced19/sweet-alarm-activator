phonon.options({
    navigator: {
        defaultPage: 'home',
        animatePages: true,
        templateRootDirectory: 'views/',
        enableBrowserBackButton: true
    },
    i18n: {
        directory: 'langs/',
        localeFallback: 'en'
    }
});

var language = localStorage.getItem('language') || (window.navigator.userLanguage || window.navigator.language).split('-')[0];
phonon.updateLocale(language);

phonon.navigator().on({page: 'home', content: 'home.html', preventClose: false, readyDelay: 0}, function(activity) {

    activity.onCreate(function () {

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
        passwordDiv.style.display = 'block';
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


phonon.i18n().bind();
phonon.navigator().start();
