"use strict";

(function diagnostic_signature_application() {

    const app = angular.module("greep", app_depends());

    app.run([...run_app_depends(), run_app]);

    app.constant("dsig", dsig_constant());
    app.constant("test_components", test_components());
    app.value("user", user_value());
    app.filter("remove_id", remove_id);

    // services/factories
    // app.factory('$templateCache', [...cache_template_depends(), cache_template]);

    // configurations
    app.config([...config_spinner_depends(), config_spinner]);
    app.config([...config_toastr_depends(), config_toastr]);
    app.config([...config_state_depends(), config_state]);
    // app.config([...config_route_depends(), config_route]);

    // components
    app_component("ds-login", ds_login());
    app_component("ds-header", ds_header());
    app_component("ds-footer", ds_footer());
    app_component("ds-steps", ds_steps());
    app_component("ds-sidebar", ds_sidebar());
    app_component("ds-welcome", ds_welcome());
    app_component("ds-positive-log", ds_positive_log());
    app_component("ds-negative-log", ds_negative_log());
    app_component("ds-cdets", ds_cdets());
    app_component("ds-expression-phrase", ds_expression_phrase());
    app_component("ds-positive-phrase", ds_positive_phrase());
    app_component("ds-negative-phrase", ds_negative_phrase());
    app_component("ds-search-row", ds_search_row());
    app_component("ds-search-bug", ds_search_bug());
    app_component("ds-retrieve-records", ds_retrieve_records());
    app_component("ds-retrieve-records-body", ds_retrieve_records_body());
    app_component("ds-define-logic", ds_define_logic());
    app_component("ds-define-logic-body", ds_define_logic_body());
    app_component("ds-define-logic-expression", ds_define_logic_expression());
    app_component("ds-define-logic-equation", ds_define_logic_equation());
    app_component("ds-define-logic-footer", ds_define_logic_footer());
    app_component("ds-validate-files", ds_validate_files());
    app_component("ds-validate-files-body", ds_validate_files_body());
    app_component("ds-finalize-record", ds_finalize_record());
    app_component("ds-finalize-record-body", ds_finalize_record_body());
    app_component("ds-review-panel", ds_review_panel());
    app_component("ds-diagnostic-signature", ds_diagnostic_signature());
    app_component("ds-field-notice", ds_field_notice());
    app_component("ds-release-notes", ds_release_notes());
    app_component("ds-doc", ds_doc());
    app_component("ds-api", ds_api());
    app_component("ds-about", ds_about());
    app_component("ds-railroad-equation", ds_railroad_equation());
    app_component("ds-upload-files", ds_upload_files());
    app.component("ds-developer", ds_developer());

    // functions

    function app_component(name, options) {
        const camel_name = Encase.toLowerCamel(name);
        const controller = angular.extend({ controllerAs: 'model' }, options);
        app.component(camel_name, controller);
    }

    function app_depends() { return [
        "ui.router", "ngRoute", "toastr", "angularSpinner"
    ];}

    function run_app_depends() { return [
        '$timeout',  '$rootScope', '$location','toastr', 'usSpinnerService',
        'dsig', 'user'
    ];}

    function run_app($timeout, $rootScope, $location, toastr, usSpinnerService, dsig, user) {
        $(document).ready(function () {
            setup_sidebar();
        });

        // NOTE: import io from <script src=".../socket.io.js"/>
        const socket = user.io.socket = io();
        socket.on(user.io.announcement_channel, function(data) {
            toastr.info(data);
            // console.log(data);
        });

        $timeout(() => {
            usSpinnerService.spin('spinner-icon');
            $timeout(() => {
                usSpinnerService.stop('spinner-icon');
            }, 1000);
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            if (fromState.name === "") {
                alert("initial state: " + toState.name);
            }
            return;
            event.preventDefault();
            dsig.header.forEach((header) => {
                if (header.path === current.$$route.originalPath) {
                    user.cdets.template = header.name;
                }
            });
        });
    }

    function config_state_depends() { return [
        "test_components", "dsig", "$logProvider", "$urlRouterProvider",
        "$locationProvider", "$stateProvider"
    ];}

    function config_state(test_components, dsig, $logProvider, $urlRouterProvider,
                          $locationProvider, $stateProvider) {
        $logProvider.debugEnabled(true);
        // $locationProvider.html5Mode(true);
        $locationProvider.html5Mode({ enabled: true, requireBase: true, rewritenLinks: true});

        const states = [
            dsig.welcome,
            ...dsig.header,
            dsig.login,
            ...dsig.footer,
            ...test_components // NOTE: testing
        ];
        states.forEach(add_state);
        $urlRouterProvider.otherwise("/welcome");
        return;

        function add_state(route) {
            $stateProvider.state(route.state, {
                url : route.path,
                template: route.template,
                controller : null,
                caseInsensitiveMatch: true
            });
        }
    }

    function config_toastr_depends() { return [
        "toastrConfig"
    ];}

    function config_toastr(toastrConfig) {
        angular.extend(toastrConfig, {
            closeHtml: '<button>&times;</button>',
            timeOut: 5*60*1000,// 5 minutes in m-sec
            newestOnTop: true,
            positionClass: 'toast-bottom-center',
            preventDuplicates: false,
            preventOpenDuplicates: false,
            target: 'body'
        });
    }

    function config_route_depends() { return [
        "test_components", "dsig", "$logProvider", "$routeProvider",
        "$locationProvider"
    ];}

    function config_route(test_components, dsig, $logProvider,
                          $routeProvider, $locationProvider) {

        const opt = { enabled: true, requireBase: true, rewritenLinks: true};
        $logProvider.debugEnabled(true);
        // $locationProvider.html5Mode(true);
        $locationProvider.html5Mode(opt);
        const routes = [
            dsig.welcome,
            ...dsig.header,
            dsig.login,
            ...dsig.footer,
            ...test_components // NOTE: testing
        ];
        routes.forEach(add_route);
        $routeProvider.otherwise({ redirectTo: "/welcome" });
        return;

        // functions
        function add_route(route) {
            $routeProvider.when(route.path, {
                template: route.template,
                caseInsensitiveMatch: true
            });
        }

    }

    function dsig_constant() {
        return {
            title: {
                name : "Diagnostic Signature Application",
                name1 : "Diagnostic Signature App", name2: "Diagnostic Signature",
                name3 : "DSig", path : "/welcome",  template : "<ds-welcome/>", copyright: "© 2017 TAC, Cisco. All right reserved."
            },
            welcome: {
                name: "welcome", state : "welcome", path : "/welcome", template : "<ds-welcome/>"
            },
            header : [
                { name : 'Steps', state : "steps",
                  path : '/steps',
                  params : {id: null}, template : "<ds-steps/>" },
                { name : 'Diagnostic Signature', state : "diagnostic_signature",
                  path : '/{id:CSC[a-z]{2,2}[0-9]{5}}',
                  params : {id: null}, template : "<ds-diagnostic-signature/>" },
                { name : 'Field Notice', state : "field_notice",
                  path : '/{id:FN[0-9]{5}}', template : "<ds-field-notice/>" },
                { name : 'Release Notes', state : "release_notes",
                  path : '/release_notes/{id}', template : "<ds-release-notes/>" }
            ],
            cdets : {
                regex : [
                    { type : 'bg', regex : /^\/CSC[a-z]{2}[0-9]{5}/, template : 'diagnostic_signature' },
                    { type : 'fn', regex : /^\/FN[0-9]{5}/, template : 'field_notice' }
                ],
                name : 'Cdets Web', state : "cdets", template : "<span/>",
                path : 'http://cdetsweb-prd.cisco.com/apps/dumpcr?parentprogram=QDDTS'
            },
            login : {
                name : 'Login', state : "login", path : '/login', template : "<ds-login/>"
            },
            footer : [
                { name : 'Document', state : "doc", path : '/doc', params: {}, template : "<ds-doc/>", target: "" },
                { name : 'API', state : "api", path : '/api', template : "<ds-api/>", target : "" },
                // { name : 'About', state : "about", path : '/about', template : "<ds-about/>", target : "" },
                { name : 'CDETS', state : "cdets({'parentprogram':'QDDTS', 'Identifier':'fn12345'})", path : 'http://cdetsweb-prd.cisco.com/apps/dumpcr?parentprogram&Identifier', template : "<span/>", target : "_blank" },
                { name : 'Cisco', state : "cisco", path : 'https://www.cisco.com', template : "<span/>", target : "_blank" },
            ]
        };
    }
    function test_components() {
        return [
            { state : "review_panel", path : '/review_panel/:title', template : '<ds-review-panel/>' },
            { state : "diagnostic_signature.finalize_record", path : '/finalize_record', template : '<ds-finalize-record/>' },
            { state : "diagnostic_signature.validate_files", path : '/validate_files', template : '<ds-validate-files/>' },
            { state : "diagnostic_signature.define_logic", path : '/define_logic', template : '<ds-define-logic/>' },
            { state : "diagnostic_signature.upload_files", path : '/upload_files', template : '<ds-upload-files/>' },
            { state : "define_logic_footer", path : '/define_logic_body/:id',
              template : '<ds-define-logic-body/>' },
            { state : "search_bug", path : '/search_bug/:id', template : '<ds-search-bug/>' },
            { state : "search_row", path : '/search_row/:id', template : '<ds-search-row/>'},
            { state : "retrieve_records_body", path : '/retrieve_records_body/:id',
              template : '<ds-retrieve-records_body/>'},
            { state : "diagnostic_signature.retrieve_records", path : '/retrieve_records', template : '<ds-retrieve-records/>'},
            { state : "positive_log", path : '/positive_log', template : '<ds-positive-log/>'},
            { state : "negative_log", path : '/negative_log', template : '<ds-negative-log/>'},
            { state : "railroad_equation", path : '/railroad_equation', template : '<ds-railroad-equation/>'},
            { state : "upload_files", path : '/upload_files', template : '<ds-upload-files/>'},
            { state : "developer", path : '/developer', template : '<ds-developer/>'}

        ];
    }

    function user_value() {
        return {
            login : {
                username : "",
                password : "",
                remember : true,
                sidebar : 0
            },
            io : {
                announcement_channel : "announcement_channel",
                socket : null,
                announcement : ""
            },
            misc : {
                cdets: "",
                cdets_url: "http://cdetsweb-prd.cisco.com/apps/dumpcr?parentprogram=QDDTS",
                ithaca: "",
                ithaca_url: "https://jira-eng-rtp1.cisco.com/jira/browse/", // ITHACA-[0-9]+
                phabricator: "",
                phabricator_url: "http://phabricator-swtg.cisco.com/", // D[0-9]+
                gitlab: "", // branch
                gitlab_url: "http://tbd"
            },
            cdets : {
                template : "",
                id : "CSCvc58663",
                sample_expression : {
                    id: "", name: "", command: "", regex: "",
                    output: "", filename: "", comment: "", widen: 0, heighten: 0
                },
                expressions : [
                    { id: "6", name: "help", command: "show help",
                      output: "aviable commmands", regex: "aviable commmands",
                      comment: "", filename: "", widen: 0, heighten:0 },
                    { id: "5", name: "detail", command: "help --detail",
                      output: "long format", regex: "long description", comment: "",
                      filename: "", widen:0, heighten:0 },
                    { id: "4", name: "short", command: "help --short ",
                      output: "short format", regex: "simple short flags", comment: "",
                      filename: "", widen: 0, heighten:0 },
                    { id: "3", name: "version", command: "show version", regex: "v\.1\.[0-9]*",
                      output: "", filename: "", comment: "", widen: 0, heighten:0 },
                    { id: "2",  name: "alpha", command: "show module",
                      regex: "important keyword alpha beta gamma delta all the way to omega",
                      output: "", filename: "", comment: "", widen: 0, heighten:0 },
                    { id: "1", name: "feb_25_2015", command: "show date",
                      regex: "Feb.*[^\\d]*25[^\\d]*2015",
                      output: "", filename: "", comment: "", widen: 0, heighten:0 }
                ]
            },
            records: [
                { author: "pushiu", dateModified: "2017-05-04 23:51:49",
                  validationState: "wip", distributionLevel: "private",
                  mongoId: "5910c2d568e3ec02ce2dde40", bugId: "CSCvc58663" },
                { author: "pushiu", dateModified: "2017-05-04 23:51:49",
                  validationState: "wip", distributionLevel: "private",
                  mongoId: "5910c2d968e3ec02ce2dde41", bugId: "CSCvc58663"  },
                { author: "pushiu", dateModified: "2017-05-08 13:43:57",
                  validationState: "validated", distributionLevel: "validated",
                  mongoId: "58e82743e3ecf8559efd3ac9", bugId: "CSCvc58663"  }
            ]
        };
    }

    function setup_sidebar() {
        const trigger = $('.hamburger');
        const overlay = $('.overlay');
        const wrapper = $('#wrapper');
        const offcanvas = $('[data-toggle="offcanvas"]');
        const hamburger_cross = define_hamburger_cross();

        trigger.click(function () {
            hamburger_cross();
        });

        offcanvas.click(function () {
            wrapper.toggleClass('toggled');
        });

        function toggle(event) {
            if (event) {
                event.preventDefault();
            }
            wrapper.toggleClass("toggled");
        };

        function define_hamburger_cross() {
            let isClosed = false;
            return function() {
                if (isClosed == true) {
                    overlay.hide();
                    trigger.removeClass('is-open');
                    trigger.addClass('is-closed');
                    isClosed = false;
                } else {
                    overlay.show();
                    trigger.removeClass('is-closed');
                    trigger.addClass('is-open');
                    isClosed = true;
                }
            };
        }
    }

    function remove_id() {
        return function(input, optional1, optional2) {
            const output = input.replace(/\/:id\?/, '');
            return output;
        };
    }


    function cache_template_depends() { return [
        "$cacheFactory", "$http", "$injector"
    ];}

    function cache_template($cacheFactory, $http, $injector) {
        var cache = $cacheFactory('templates');
        var allTplPromise;

        return {
            get: function(url) {
                var fromCache = cache.get(url);

                // already have required template in the cache
                if (fromCache) {
                    return fromCache;
                }

                // first template request ever - get the all tpl file
                if (!allTplPromise) {
                    allTplPromise = $http.get('/client/templates.html').then(function(response) {
                        // compile the response, which will put stuff into the cache
                        $injector.get('$compile')(response.data);
                        return response;
                    });
                }

                // return the all-tpl promise to all template requests
                return allTplPromise.then(function(response) {
                    return {
                        status: response.status,
                        data: cache.get(url)
                    };
                });
            },

            put: function(key, value) {
                cache.put(key, value);
            }
        };
    }

    function config_spinner_depends() { return [
        "usSpinnerConfigProvider"
    ];}

    function config_spinner(usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setDefaults({color: 'grey'});
    }

    function ds_login() { // <ds-login/>
        return {
            templateUrl : "/client/login.html",
            controller: ds_login_controller
        };

        function ds_login_controller(user, $templateCache) {
            const model = this;
            model.user = user;
        }
    }

    function ds_header() { // <ds-header>
        return {
            templateUrl: "/client/header.html",
            controller: ds_header_controller
        };

        function ds_header_controller(dsig, user, $stateParams, $routeParams,
                                      $location, $scope, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.welcome = welcome;
            model.$location = $location;
            model.toggle_sidebar = toggle_sidebar;
            model.select_template = select_template;
            model.change_id = change_id;
            model.dropdown_cdets = dropdown_cdets;
            model.dropdown_href = dropdown_href;
            model.dropdown_sref = dropdown_sref;

            if ($stateParams.id) {
                model.dsig.cdets.regex.forEach(function(pattern) {
                    const matched = pattern.regex.test('/' + $stateParams.id);
                    if (matched) {
                        model.user.cdets.id = $stateParams.id;
                    }
                });
            }

            setTimeout(() => { // Note: wait till ng cycle is done
                $('.select_template').on("click", function (event) {
                    // model.template = event.currentTarget.getAttribute('data-template-name');
                    // debugger;
                });
            });

            setTimeout(() => { // Note: wait till ng cycle is done
                model.dsig.cdets.regex.forEach(function(pattern) {
                    const matched = pattern.regex.test($location.$$path);
                    if (matched) {
                        // model.old_template = model.template;
                        // model.template = pattern.template;
                        model.user.cdets.template = pattern.template;
                    }
                });
            });

            setTimeout(() => { // Note: wait till ng cycle is done
                const sidebar = 'sidebar';
                if (($location.$$hash === sidebar) ||
                    ($location.$$search[sidebar] && JSON.parse($location.$$search[sidebar])) ||
                    ($stateParams[sidebar]) && JSON.parse($stateParams[sidebar])) {
                    model.toggle_sidebar();
                }
            });

            function extract_template() {
                let template = "Select a template";
                model.dsig.header.map(function(header) {
                    header.path = header.path.replace(/:id\?/, '');
                    return header;
                }).forEach(function(header) {
                    const match = model.$location.$$path.match(header.path);
                    if (match) {
                        template = header.name;
                    }
                });
                return template;
            }

            function dropdown_cdets() {
                return model.dsig.cdets.path + '&identifier=' + model.user.cdets.id;
            }

            function dropdown_sref(menu) {
                return menu.state + "({id: model.user.cdets.id})";
            }

            function dropdown_href(menu) {
                let href = menu.path.replace(/\/:id\?/, '') + '/';
                href += model.user.cdets.id;
                if (model.user.login.sidebar) {
                    href += '?sidebar=1';
                }
                return href;
            }

            function select_template(event) {
                return; /////////////////////////////
            }

            function change_id (event) {
                model.dsig.cdets.regex.forEach(function(pattern) {
                    const id = "/" + model.user.cdets.id;
                    const matched = pattern.regex.test(id);
                    if (matched) {
                        model.user.cdets.template = pattern.template;
                        model.$location.path(id);
                    }
                });
            }

            function toggle_sidebar(event) {
                if (event) {
                    event.preventDefault();
                    const search = model.$location.search();
                    search.sidebar = parseInt(search.sidebar || "0");
                    model.user.login.sidebar = (model.user.login.sidebar === 1) ? 0 : 1;
                    search.sidebar = (search.sidebar === 1) ? 0 : 1;
                    model.$location.search(search);
                } else {
                    const search = model.$location.search();
                    model.user.login.sidebar = parseInt(search.sidebar);
                }

                $('#wrapper').toggleClass("toggled");
            }

            function welcome(event) {
                event.preventDefault();
                model.$location.path('/welcome');
            }

        }
    }

    function ds_footer() { // <ds-footer>
        return {
            templateUrl: "/client/footer.html",
            controller: ds_footer_controller
        };

        function ds_footer_controller(dsig, $templateCache) {
            const model = this;
            model.dsig = dsig;
        }
    }

    function ds_steps() { // <ds-steps>
        return {
            templateUrl: "/client/steps.html",
            controller: ds_steps_controller
        };

        function ds_steps_controller(dsig, $templateCache) {
            const model = this;
            model.dsig = dsig;
        }
    }

    function ds_sidebar() { // <ds-sidebar>
        return {
            templateUrl: "/client/sidebar.html",
            controller: ds_sidebar_controller
        };

        function ds_sidebar_controller(dsig, user, toastr, $window, $location, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.$location = $location;
            model.$window = $window;

            model.cdets_change = cdets_change;
            model.ithaca_change = ithaca_change;
            model.phabricator_change = phabricator_change;
            model.announcement_change = announcement_change;

            function announcement_change($event) {
                var keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {
                    model.user.io.socket.emit(user.io.announcement_channel, {
                        message : model.user.io.announcement
                    });
                    model.user.io.announcement = "";
                }
            }

            function cdets_change($event) {
                var keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {
                    const url = model.user.misc.cdets_url + '&identifier=' + model.user.misc.cdets;
                    window.open(url, '_blank');
                    const toast = toastr.info('open CDETS ' + model.user.misc.cdets);
                }
            }

            function ithaca_change($event) {
                var keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {
                    const no = model.user.misc.ithaca.replace(/^I-/, '').replace(/^ITHACA-/, '');
                    const url = model.user.misc.ithaca_url + 'ITHACA-' + no;
                    window.open(url, '_blank');
                    const toast = toastr.info('open ITHACA ' + model.user.misc.ithaca);
                }
            }

            function phabricator_change($event) {
                var keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {
                    const no = model.user.misc.phabricator.replace(/^D/, '');
                    const url = model.user.misc.phabricator_url + 'D' + no;
                    window.open(url, '_blank');
                    const toast = toastr.info('open Phabricator ' + model.user.misc.phabricator);
                }
            }
        }
    }

    function ds_welcome() { // <ds-welcome>
        return {
            templateUrl: "/client/welcome.html",
            controller : ds_welcome_controller
        };

        function ds_welcome_controller(user, dsig, $templateCache) {
            const model = this;
            model.user = user;
            model.dsig = dsig;
        }
    }

    function ds_positive_log2() { // <ds-positive-log2>
        return {
            templateUrl: "/client/positive_log2.html",
            controller : ds_positive_log2_controller
        };

        function ds_positive_log2_controller($templateCache) {
        }
    }

    function ds_positive_log() { // <ds-positive-log>
        return {
            templateUrl: "/client/positive_log.html",
            controller : ds_positive_log_controller
        };

        function ds_positive_log_controller($templateCache) {
        }
    }


    function ds_negative_log() { // <ds-negative-log>
        return {
            templateUrl: "/client/negative_log.html",
            controller : ds_negative_log_controller
        };

        function ds_negative_log_controller($templateCache) {

        }
    }

    function ds_cdets() { // <ds-cdets>
        return {
            templateUrl: "/client/cdets.html",
            controller : ds_cdets_controller
        };

        function ds_cdets_controller($templateCache) {
        }
    }

    function ds_expression_phrase() { // <ds-expression-phrase>
        return {
            bindings : {
                word : "<"
            },
            transclude: true,
            templateUrl: '/client/expression_phrase.html',
            controller: function(dsig, user, $templateCache) {
            }
        };
    }

    function ds_positive_phrase() { // <ds-positive-phrase>
        return {
            bindings : {
                word : "<"
            },
            transclude: true,
            templateUrl: '/client/positive_phrase.html',
            controller: function(dsig, user, $templateCache) {
            }
        };
    }

    function ds_negative_phrase() { // <ds-negative-phrase>
        return {
            bindings : {
                word : "<"
            },
            transclude: true,
            templateUrl: '/client/negative_phrase.html',
            controller: function(dsig, user, $templateCache) {
            }
        };
    }

    function ds_search_row() { // <ds-search-row>
        return {
            bindings : {
                id : '='
            },
            templateUrl : "/client/search_row.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_search_bug() { // <ds-search-bug>
        return {
            bindings : {
                style : '@',
                id : '='
            },
            templateUrl : "/client/search_bug.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_retrieve_records() { // <ds-retrieve-records>
        return {
            bindings : {
                expand : "@"
            },
            templateUrl: "/client/retrieve_records.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_retrieve_records_body() { // <ds-retrieve-records-body>
        return {
            templateUrl: "/client/retrieve_records_body.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_define_logic() { // <ds-define-logic>
        return {
            bindings : {
                expand : "@"
            },
            templateUrl: "/client/define_logic.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_define_logic_expression() { // <ds-define-logic-expression>
        return {
            bindings : {
                options : '<',
                remove : '=',
                expression : "="
            },
            templateUrl: "/client/define_logic_expression.html",
            controller: ds_define_logic_expression_controller
        };

        function ds_define_logic_expression_controller(dsig, user, $stateParams,
                                                       $routeParams, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.private_keys = ['id', 'name', 'widen', 'heighten'];
            model.hidden_keys = ['output', 'filename', 'comment'];
            model.expand_width = expand_width;
            model.shrink_width = shrink_width;
            model.expand_height = expand_height;
            model.shrink_height= shrink_height;
            model.cycle_height = cycle_height;
            model.visible = visible;
            console.log(model);

            if ($stateParams.id) {
                model.user.cdets.id = $stateParams.id;
            }

            function visible(key) {
                const private_keys = model.private_keys.includes(key);
                if (private_keys) { return false; }
                if (model.expression.heighten === 0) { return false; }
                const hidden_keys = model.hidden_keys.includes(key) && (model.expression.heighten === 1);
                if (hidden_keys) {
                    return false;
                }
                return true;
            }

            function expand_width() {
                model.expression.widen = Math.min(2,(model.expression.widen + 1));
            }

            function shrink_width() {
                model.expression.widen = Math.max(0, (model.expression.widen - 1));
            }

            function expand_height() {
                model.expression.heighten = Math.min(2,(model.expression.heighten + 1));
            }

            function shrink_height() {
                model.expression.heighten = Math.max(0, (model.expression.heighten - 1));
            }

            function cycle_height() {
                model.expression.heighten = (model.expression.heighten + 1) % 3;
            }
        }
    }

    function ds_define_logic_equation() { // <ds-define-logic-equation>
        return {
            bindings : {
                prepend : '=',
                equation : "="
            },
            templateUrl: "/client/define_logic_equation.html",
            controller: ds_define_logic_equation_controller
        };

        function ds_define_logic_equation_controller(dsig, user, $stateParams,
                                                     $routeParams, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.formula = "";
            model.update_formula = update_formula;
            console.log(model);

            setTimeout(() => {
                model.formula = update_formula();
            });

            function update_formula() {
                /*
                  model.formula = model.eq.split(/[ \t\n\r]+/).map((exp) => {
                  if (exp.match(/[_a-zA-Z][a-zA-Z0-9]/)) {
                  return "<ds-expression-phrase>" + exp + "</ds-expression-phrase>";
                  } else {
                  return exp;
                  }
                  }).join(' ');
                  console.log(model.formula);
                */
                model.formula = model.equation;
                return model.formula;
            }

        }
    }

    function ds_define_logic_body() { // <ds-define-logic-body>
        return {
            templateUrl: "/client/define_logic_body.html",
            controller: ds_define_logic_body_controller
        };

        function ds_define_logic_body_controller(dsig, user, $stateParams,
                                                 $routeParams, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.equation = "feb_25_2015 && ( alpha || ( help && ( detail || short) ))&& version";
            model.remove = remove;
            model.prepend = prepend;
            model.sample_expression = model.user.cdets.sample_expression;

            model.expressions = model.user.cdets.expressions;
            console.log(model);

            if ($stateParams.id) {
                model.user.cdets.id = $stateParams.id;
            }

            function prepend() {
                const exp = Object.assign({}, model.sample_expression);
                exp.id = Math.max(...model.expressions.map((exp) => (parseInt(exp.id,10)))) + 1;
                exp.name = 'Condition' + exp.id;
                model.expressions.unshift(exp);
            }

            function remove(id) {
                model.expressions = model.expressions.filter((exp) => (exp.id !== id));
            }
        }
    }

    function ds_define_logic_footer() { // <ds-define-logic-footer>
        return {
            templateUrl: "/client/define_logic_footer.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_validate_files() { // <ds-validate-files>
        return {
            bindings : {
                expand : "@"
            },
            templateUrl: "/client/validate_files.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_validate_files_body() { // <ds-validate-files-body>
        return {
            templateUrl: "/client/validate_files_body.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_finalize_record() { // <ds-finalize-record>
        return {
            bindings : {
                expand : "@"
            },
            templateUrl: "/client/finalize_record.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_finalize_record_body() { // <ds-finalize-record-body>
        return {
            bindings : {
                expand : "@"
            },
            templateUrl: "/client/finalize_record_body.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_review_panel() { // <ds-review-panel>
        return {
            bindings : {
                title : "@",
                review : "@",
                percent : "@"
            },
            templateUrl: "/client/review_panel.html",
            controller: function(user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.user = user;

                if ($stateParams.id) {
                    model.user.cdets.id = $stateParams.id;
                }
            }
        };
    }

    function ds_diagnostic_signature() { // <ds-diagnostic-signature>
        return {
            templateUrl : "/client/diagnostic_signature2.html",
            controller: ds_diagnostic_signature_controller
        };

        function ds_diagnostic_signature_controller(dsig, user, $stateParams, $routeParams,
                                                    $location, $templateCache, $timeout) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            model.tabs = [
                'retrieve_records', 'define_logic',
                'validate_files', 'finalize_record'
            ];
            model.add_query = add_query;
            model.$location = $location;

            if ($stateParams.id) {
                model.user.cdets.id = $stateParams.id;
            }
            // debugger;
            $timeout(() => { // Note: wait till ng cycle is done
                model.tabs.forEach((tab) => {
                    const active = (($location.$$hash === tab) ||
                                    ($location.$$search[tab] && JSON.parse($location.$$search[tab])) ||
                                    ($routeParams[tab] && JSON.parse($routeParams[tab])));
                    const tag = $('#' + tab);
                    if (tag) {
                        if (active) {
                            tag.toggleClass('active');
                        } else {
                            tag.removeClass('active');
                        }
                    }
                });
            });

            function add_query(tab) {
                let path = model.$location.$$path;
                $timeout(() => {
                    // path = path + '?' + tab + '=1';
                    model.$location.path(path).search(tab).hash();
                    // console.log(model.$location.$$path);
                });
            }
        }
    }

    function ds_field_notice() { // <ds-field-notice>
        return {
            templateUrl: "/client/field_notice.html",
            controller: function(dsig, user, $stateParams, $routeParams, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
            }
        };
    }

    function ds_release_notes() { // <ds-release-notes>
        return {
            templateUrl: "/client/release_notes.html",
            controller: function(dsig, user, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
            }
        };
    }

    function ds_doc() { // <ds-doc>
        return {
            templateUrl: "/client/doc.html",
            controller: function(dsig, user, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
            }
        };
    }

    function ds_api() { // <ds-api>
        return {
            templateUrl: "/client/api.html",
            controller: function(dsig, user, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
            }
        };
    }

    function ds_about() { // <ds-about>
        return {
            templateUrl: "/client/about.html",
            controller: function(dsig, user, $templateCache) {
                const model = this;
                model.dsig = dsig;
                model.user = user;
            }
        };
    }

    function ds_railroad_equation() { // <ds-railroad-equation>
        return {
            templateUrl : "/client/railroad_equation.html",
            controller: function(dsig, user) {
                const model = this;
                model.dsig = dsig;
                model.user = user;

                // const {Diagram} = require('node_modules/grammkit/grammkit.js');
                // const peg = require('bower_components/pegjs/peg-0.10.0.js')

                // const diagram = new Diagram([]);
                const grammar = peg.parser.parse('start = feb_25_2015 alpha version');
                console.log(grammar);
                // const svg = grammkit.diagram(grammar.rules[0]);
                // console.log(svg);
            }
        };
    }

    function ds_developer() { // <ds-developer>
        return {
            templateUrl : "/client/developer.html",
            controller: function(dsig, user) {
                const model = this;
                model.disg = dsig;
                model.user = user;
            }
        };
    }

    function ds_upload_files() { // <ds-upload-files>
        return {
            templateUrl : "/client/upload_files.html",
            controller: function(dsig, user, $timeout) {
                const model = this;
                model.user = user;
                model.dsig = dsig;
                model.text = `
Donec enim diam, vulputate ut pharetra sit amet, aliquam id diam maecenas ultricies mi
eget mauris pharetra et ultrices neque?

Sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus
non enim praesent elementum facilisis leo, vel fringilla est ullamcorper! Amet facilisis
magna etiam tempor, orci eu lobortis? Volutpat sed cras ornare arcu dui vivamus arcu
felis, bibendum ut tristique et, egestas quis ipsum suspendisse ultrices gravida dictum
fusce ut placerat orci nulla?

Vivamus at augue eget arcu dictum varius duis at consectetur lorem donec massa sapien,
faucibus et molestie ac, feugiat sed lectus? Augue mauris augue neque, gravida in fermentum
et, sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu
tincidunt.

Condimentum lacinia quis vel eros. Sapien nec sagittis aliquam malesuada bibendum arcu
vitae elementum curabitur vitae nunc? Quis enim lobortis scelerisque fermentum dui
faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit
amet massa vitae tortor.

Donec enim diam, vulputate ut pharetra sit amet, aliquam id diam maecenas ultricies mi
eget mauris pharetra et ultrices neque ornare aenean euismod elementum nisi, quis. Diam
quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis
eu volutpat odio facilisis mauris sit amet massa vitae tortor!

Montes, nascetur ridiculus mus mauris vitae ultricies leo. Ornare arcu odio ut sem nulla
pharetra diam sit amet nisl suscipit adipiscing bibendum est ultricies integer quis!
Egestas integer eget aliquet nibh praesent tristique magna sit amet purus gravida quis
blandit turpis cursus in hac habitasse platea dictumst quisque sagittis, purus sit.
Donec adipiscing tristique risus nec feugiat in fermentum posuere!

Vivamus at augue eget arcu dictum varius duis at consectetur lorem donec massa sapien,
faucibus et molestie ac, feugiat sed lectus? Augue mauris augue neque, gravida in fermentum
et, sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu
tincidunt.

Condimentum lacinia quis vel eros. Sapien nec sagittis aliquam malesuada bibendum arcu
vitae elementum curabitur vitae nunc? Quis enim lobortis scelerisque fermentum dui
faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit
amet massa vitae tortor.

Donec enim diam, vulputate ut pharetra sit amet, aliquam id diam maecenas ultricies mi
eget mauris pharetra et ultrices neque ornare aenean euismod elementum nisi, quis. Diam
quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis
eu volutpat odio facilisis mauris sit amet massa vitae tortor!

Montes, nascetur ridiculus mus mauris vitae ultricies leo. Ornare arcu odio ut sem nulla
pharetra diam sit amet nisl suscipit adipiscing bibendum est ultricies integer quis!
Egestas integer eget aliquet nibh praesent tristique magna sit amet purus gravida quis
blandit turpis cursus in hac habitasse platea dictumst quisque sagittis, purus sit.
Donec adipiscing tristique risus nec feugiat in fermentum posuere!
`;
                $timeout(() => {
                    model.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                        lineNumbers: true,
                        theme: "default",
                        // mode: "markdown",
                        // extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
                        highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
                    });
                }, 0, false);
            }
        };
    }
})();
