
(function diagnostic_signature_ng_app() {
    
    "use strict";
    
    const app = angular.module("loggrep", ["ngRoute", "toastr", "angularSpinner"]);
    app.constant("dsig", dsig_constant());
    app.constant("test_components", test_components());
    app.value("user", user_value());
    app.filter("remove_id", remove_id);
    // app.factory('$templateCache', ["$cacheFactory", "$http", "$injector", cache_template]);
    app.config(["usSpinnerConfigProvider", spin_config]);
    app.config(["toastrConfig", toastr_config]);
    app.config(["test_components", "dsig", "$logProvider", "$routeProvider", "$locationProvider",
                route_config]);
    // app.config(["test_components", "dsig", "$logProvider", "$urlRouterProvider", "$stateProvider",
    //             "$locationProvider", state_config]);
    app.run(['$location','toastr', 'usSpinnerService', 'user', run_app]);

    // components
    app.component("dsLogin", {
        controllerAs : "model",
        templateUrl : "/client/login.html",
        controller: function(user, $templateCache) {
            const model = this;
            model.user = user;
            // console.log($templateCache.get("/client/login.html"));
        }
    });
    
    app.component("dsHeader",  {
        controllerAs : "model",
        templateUrl: "/client/header.html",
        controller: function(dsig, user, $routeParams, $location, $scope, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            model.welcome = welcome;
            model.template = "Diagnostic Signature";
            model.$location = $location;
            model.old_id = "";
            model.old_template = "";
            model.toggle_sidebar = toggle_sidebar;
            model.select_template = select_template;
            model.change_id = change_id;

            // $templateCache.get("/client/header.html");
            if ($routeParams.id) {
                model.old_id = $routeParams.id;
            }

            setTimeout(() => { // Note: wait till ng cycle is done
                $('.select_template').on("click", function (event) {
                    model.template = event.currentTarget.getAttribute('data-template-name');
                    // debugger;                    
                });
            });
            
            setTimeout(() => { // Note: wait till ng cycle is done
                model.dsig.header.forEach(function(header) {
                    const matched = ($location.$$path.match(header.path));
                    if (matched) {
                        model.old_template = model.template;
                        model.template = header.name;
                    }
                });
            });
            
            setTimeout(() => { // Note: wait till ng cycle is done
                const sidebar = 'sidebar';
                if (($location.$$hash === sidebar) ||
                    ($location.$$search[sidebar] && JSON.parse($location.$$search[sidebar])) ||
                    ($routeParams[sidebar]) && JSON.parse($routeParams[sidebar])) {
                    model.toggle_sidebar();
                }
            });

            function select_template(event) {
                return; /////////////////////////////
                
                // event.stop
                const model = this;
                let old_route = "";
                let new_route = "";

                model.dsig.header.forEach(function(header) {
                    if (model.old_template === header.name) {
                        old_route = header.path;
                    }
                    if (model.template === header.name) {
                        new_route = header.path;
                    }
                });
                const path = model.$location.$$absUrl.replace(old_route, new_route);
                console.log(path);
                model.old_template = model.template;
                // model.template = new_template;
                // model.$location.path(path);
            }
            
            function change_id () {
                let path = model.$location.$$path;
                if (model.old_id === "") {
                    path = model.$location.$$path + "/" + model.user.cdets.id;
                } else {
                    path = path.replace(model.old_id, model.user.cdets.id);
                }
                model.$location.path(path);                
                model.old_id = model.user.cdets.id;
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
    });

    app.component("dsFooter",  {
        controllerAs : "model",
        templateUrl: "/client/footer.html",
        controller: function(dsig, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            // $templateCache.get("/client/footer.html");            
        }
    });

    app.component("dsSidebar",  {
        controllerAs : "model",
        templateUrl: "/client/sidebar.html",
        controller: function(dsig, user, toastr, $window, $location, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            model.$location = $location;
            model.$window = $window;
            
            model.cdets_change = cdets_change;
            model.ithaca_change = ithaca_change;
            model.phabricator_change = phabricator_change;
            model.announcement_change = announcement_change;
            
            // $templateCache.get("/client/sidebar.html");
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
    });
    
    
    app.component("dsWelcome", {
        controllerAs : "model",
        templateUrl: "/client/welcome.html",
        constroller : function ($templateCache) {
            // $templateCache.get("/client/welcome.html");
        }        
    });

    app.component("dsPosLog", {
        controllerAs : "model",
        templateUrl: "/client/positive_log.html",
        constroller : function ($templateCache) {
            // $templateCache.get("/client/positive_log.html");
        }
    });

    app.component("dsNegLog", {
        controllerAs : "model",
        templateUrl: "/client/negative_log.html",
        constroller : function ($templateCache) {
            // $templateCache.get("/client/negative_log.html");
        }
    });

    app.component("dsCdets", {
        controllerAs : "model",
        templateUrl: "/client/cdets.html",
        constroller : function ($templateCache) {
            // $templateCache.get("/client/cdets.html");
        }
    });
    
    app.component("dsPosPhrase", {
        bindings : {
            word : "<"
        },
        transclude: true,
        controllerAs : "model",
        templateUrl: '/client/positive_phrase.html',
        controller: function(dsig, user, $templateCache) {
            // $templateCache.get("/client/positive_phrase.html");
        }
    });

    app.component("dsNegPhrase", {
        bindings : {
            word : "<"
        },
        transclude: true,
        controllerAs : "model",
        templateUrl: '/client/negative_phrase.html',
        controller: function(dsig, user, $templateCache) {
            // $templateCache.get("/client/negative_phrase.html");
        }
    });

    app.component("dsSearchRow", {
        bindings : {
            id : '='
        },
        controllerAs : "model",
        templateUrl : "/client/search_row.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/search_row.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsSearchBug", {
        controllerAs : "model",
        bindings : {
            style : '@',
            id : '='
        },
        templateUrl : "/client/search_bug.html",        
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/search_bug.html");            
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsRetrieveRecords", {
        controllerAs : "model",
        templateUrl: "/client/retrieve_records.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/retrieve_records.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });

    app.component("dsRetrieveRecordsBody", {
        controllerAs : "model",
        templateUrl: "/client/retrieve_records_body.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/retrieve_records_body.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsDefineLogic", {
        controllerAs : "model",
        templateUrl: "/client/define_logic.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/define_logic.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });

    app.component("dsDefineLogicBody", {
        controllerAs : "model",
        templateUrl: "/client/define_logic_body.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/define_logic_body.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });

    app.component("dsDefineLogicFooter", {
        controllerAs : "model",
        templateUrl: "/client/define_logic_footer.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/define_logic_footer.html");            
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsValidateFiles", {
        controllerAs : "model",
        templateUrl: "/client/validate_files.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/validate_files.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });

    app.component("dsValidateFilesBody", {
        controllerAs : "model",
        templateUrl: "/client/validate_files_body.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/validate_files_body.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsFinalizeRecord", {
        controllerAs : "model",
        bindings : {
            expand : "@"
        },
        templateUrl: "/client/finalize_record.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/finalize_record.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });

    app.component("dsFinalizeRecordBody", {
        controllerAs : "model",
        bindings : {
            expand : "@"
        },
        templateUrl: "/client/finalize_record_body.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/finalize_record_body.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsReviewPanel", {
        bindings : {
            title : "@",
            review : "@",
            percent : "@"
        },
        controllerAs : "model",
        templateUrl: "/client/review_panel.html",
        controller: function(user, $routeParams, $templateCache) {
            const model = this;
            model.user = user;
            // $templateCache.get("/client/review_panel.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
        }
    });
    
    app.component("dsDiagnosticSignature", {
        controllerAs : "model",
        templateUrl : "/client/diagnostic_signature.html",
        controller: function(dsig, user, $routeParams, $location, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            model.tabs = [
                'retrieve_records', 'define_logic',
                'validate_files', 'finalize_record'
            ];
            model.add_query = add_query;
            model.$location = $location;
            // $templateCache.get("/client/diagnostic_signature.html");
            if ($routeParams.id) {
                model.user.cdets.id = $routeParams.id;
            }
            // debugger;
            setTimeout(() => { // Note: wait till ng cycle is done
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
                setTimeout(() => {
                    // path = path + '?' + tab + '=1';
                    model.$location.path(path).search(tab).hash();
                    // console.log(model.$location.$$path);
                });
            }
        }
        
    });

    app.component("dsFieldNotice", {
        controllerAs : "model",
        templateUrl: "/client/field_notice.html",
        controller: function(dsig, user, $routeParams, $templateCache) {
            const model = this;            
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/field_notice.html");
            // model.user.cdets.id = 'FN' + $routeParams.id;
            
        }
    });

    app.component("dsReleaseNotes", {
        controllerAs : "model",
        templateUrl: "/client/release_notes.html",
        controller: function(dsig, user, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/release_notes.html");
        }
    });

    app.component("dsDoc", {
        controllerAs : "model",
        templateUrl: "/client/doc.html",
        controller: function(dsig, user, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/doc.html");
        }
    });

    app.component("dsApi", {
        controllerAs : "model",
        templateUrl: "/client/api.html",
        controller: function(dsig, user, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/api.html");
        }
    });

    app.component("dsAbout", {
        controllerAs : "model",
        templateUrl: "/client/about.html",
        controller: function(dsig, user, $templateCache) {
            const model = this;
            model.dsig = dsig;
            model.user = user;
            // $templateCache.get("/client/about.html");
        }
    });

    // functions
    function run_app($location, toastr, usSpinnerService, user) {
        $(document).ready(function () {
            setup_sidebar();
        });

        // NOTE: import io from <script src=".../socket.io.js"/>
        const socket = user.io.socket = io();
        socket.on(user.io.announcement_channel, function(data) {
            toastr.info(data);
            // console.log(data);            
        });

        setTimeout(() => {
            usSpinnerService.spin('spinner-icon');
            setTimeout(() => {
                usSpinnerService.stop('spinner-icon');
            }, 1000);
        });
    }

    function state_config(test_components, dsig, $logProvider, $stateProvider,
                          $urlRouterProvider, $locationProvider) {        
        $logProvider.debugEnabled(true);
        // $locationProvider.html5Mode(true);
        $locationProvider.html5Mode({ enabled: true, requireBase: true, rewritenLinks: true});
        
        const routes = [
            dsig.welcome, ...dsig.header, dsig.login, ...dsig.footer,
            ...test_components // NOTE: testing            
        ];
        routes.forEach(add_route);
        $urlRouterProvider.otherwise("/welcome");
        return;

        function add_route(route) {
            $stateProvider.state(route.state, {
                url : route.path,
                template: route.template,
                caseInsensitiveMatch: true                
            });
        }
    }

    function toastr_config(toastrConfig) {
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
    
    function route_config(test_components, dsig, $logProvider, $routeProvider, $locationProvider) {

        $logProvider.debugEnabled(true);
        // $locationProvider.html5Mode(true);
        $locationProvider.html5Mode({ enabled: true, requireBase: true, rewritenLinks: true});
        const routes = [
            dsig.welcome, ...dsig.header, dsig.login, ...dsig.footer,
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
                name : "Diagnostic Signature Application", path : "/welcome", template : "<ds-welcome/>"
            },
            welcome: {
                name: "welcome", state : "welcome", path : "/welcome", template : "<ds-welcome/>"
            },
            template : "",
            header : [
                { name : 'Diagnostic Signature', state : "diagnostic_signature",
                  path : '/diagnostic_signature/:id?', template : "<ds-diagnostic-signature/>" },
                { name : 'Field Notice', state : "field_notice",
                  path : '/field_notice/:id?', template : "<ds-field-notice/>" },
                { name : 'Release Notes', state : "release_notes",
                  path : '/release_notes/:id?', template : "<ds-release-notes/>" }
            ],
            cdets : {
                name : 'Cdets Web', state : "cdets", template : "<span/>",
                path : 'http://cdetsweb-prd.cisco.com/apps/dumpcr?parentprogram=QDDTS'
            },
            login : {
                name : 'Login', state : "login", path : '/login', template : "<ds-login/>"
            },
            footer : [
                { name : 'Document', state : "doc", path : '/doc', template : "<ds-doc/>" },
                { name : 'API', state : "api", path : '/api', template : "<ds-api/>" },
                { name : 'About', state : "about", path : '/about', template : "<ds-about/>" },
                { name : 'Cisco', state : "cisco", path : 'https://www.cisco.com', template : "<span/>" },
            ]
        };
    }
    function test_components() {
        return [
            { state : "review_panel", path : '/review_panel/:title', template : '<ds-review-panel/>' },
            { state : "finalize_record", path : '/finalize_record/:id', template : '<ds-finalize-record/>' },
            { state : "validate_files", path : '/validate_files/:id', template : '<ds-validate-files/>' },
            { state : "define_logic", path : '/define_logic/:id', template : '<ds-define-logic/>' },
            { state : "define_logic_footer", path : '/define_logic_body/:id',
              template : '<ds-define-logic-body/>' },
            { state : "search_bug", path : '/search_bug/:id', template : '<ds-search-bug/>' },
            { state : "search_row", path : '/search_row/:id', template : '<ds-search-row/>'},
            { state : "retrieve_records_body", path : '/retrieve_records_body/:id',
              template : '<ds-retrieve-records_body/>'},
            { state : "retrieve_records", path : '/retrieve_records/:id', template : '<ds-retrieve-records/>'},
            { state : "pos_log", path : '/pos_log', template : '<ds-pos-log/>'},
            { state : "neg_log", path : '/neg_log', template : '<ds-neg-log/>'}
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
                cdets_url : "http://cdetsweb-prd.cisco.com/apps/dumpcr?parentprogram=QDDTS",
                ithaca : "",
                ithaca_url : "https://jira-eng-rtp1.cisco.com/jira/browse/", // ITHACA-[0-9]+
                phabricator : "",
                phabricator_url : "http://phabricator-swtg.cisco.com/" // D[0-9]+
            },
            cdets : {
                id : "CSCvc58663",
                regex : [
                    { type : 'bug', regex : '/^CSC[a-z]{2}\d{5}$/' },
                    { type : 'fn', regex : '/^FN\d{5}$/' }
                ],
                expressions : [
                    { label: "feb_02_17", logs : "", command : "show date",
                      output: "2017-02-17 10am", regex: "", comments : "" },
                    { label: "ios_version", logs : "", command : "show version",
                      output: "", regex: "IOS v1.2.3", comments : "" },                    
                    { label: "help_command", logs : "", command : "run help",
                      output: "", regex: "print helpful info", comments : "" },
                    { label: "misspell_ios", logs : "", command : "explain help",
                      output: "", regex: "iOS", comments : "" }
                ]
            },
            records : [
                { author: "pushiu", dateModified : "2017-05-04 23:51:49",
                  validationState : "wip", distributionLevel : "private",
                  mongoId: "5910c2d568e3ec02ce2dde40", bugId : "CSCvc58663" },
                { author: "pushiu", dateModified : "2017-05-04 23:51:49",
                  validationState: "wip", distributionLevel: "private",
                  mongoId : "5910c2d968e3ec02ce2dde41", bugId : "CSCvc58663"  },
                { author: "pushiu", dateModified : "2017-05-08 13:43:57",
                  validationState: "validated", distributionLevel: "validated",
                  mongoId : "58e82743e3ecf8559efd3ac9", bugId : "CSCvc58663"  }
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

    function spin_config(usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setDefaults({color: 'grey'});
    }
    
})();


