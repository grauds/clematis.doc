"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[613],{2950:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>p,frontMatter:()=>o,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"web-applications/database-initialization","title":"Database Initialization","description":"There are several ways","source":"@site/docs/web-applications/database-initialization.md","sourceDirName":"web-applications","slug":"/web-applications/database-initialization","permalink":"/clematis.doc/docs/web-applications/database-initialization","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"spring-data","permalink":"/clematis.doc/docs/tags/spring-data"},{"inline":true,"label":"hibernate","permalink":"/clematis.doc/docs/tags/hibernate"},{"inline":true,"label":"flyway","permalink":"/clematis.doc/docs/tags/flyway"}],"version":"current","sidebarPosition":13,"frontMatter":{"sidebar_position":13,"tags":["spring-data","hibernate","flyway"]},"sidebar":"tutorialSidebar","previous":{"title":"Business Domain","permalink":"/clematis.doc/docs/web-applications/business-domain/"},"next":{"title":"Serving Data","permalink":"/clematis.doc/docs/web-applications/serving-data/"}}');var i=a(74848),s=a(28453);const o={sidebar_position:13,tags:["spring-data","hibernate","flyway"]},r="Database Initialization",l={},d=[{value:"Money Tracker",id:"money-tracker",level:2},{value:"Cosmic",id:"cosmic",level:2},{value:"Clematis Weather",id:"clematis-weather",level:2},{value:"Configuration",id:"configuration",level:3},{value:"Data Import",id:"data-import",level:3},{value:"Dependable Components",id:"dependable-components",level:2}];function c(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"database-initialization",children:"Database Initialization"})}),"\n",(0,i.jsxs)(n.p,{children:["There are ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/how-to/data-initialization.html",children:"several ways"}),"\nto import data to persistent storage. Almost all Clematis projects\ndeal with some legacy data they need to import or modify first."]}),"\n",(0,i.jsx)(n.h2,{id:"money-tracker",children:"Money Tracker"}),"\n",(0,i.jsxs)(n.p,{children:["Money Tracker uses Spring ",(0,i.jsx)(n.a,{href:"https://github.com/grauds/money.tracker.api/blob/master/src/main/resources/schema.sql",children:(0,i.jsx)(n.code,{children:"schema.sql"})}),"\nfile to add SQL views and stored procedures\nto existing data tables, see ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-basic-sql-scripts",children:"documentation"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-sql",metastring:'title="src/main/resources/schema.sql"',children:"CREATE OR ALTER VIEW ...\n                \nCREATE OR ALTER PROCEDURE ...                \n"})}),"\n",(0,i.jsx)(n.p,{children:"The file is checking for presence of views and procedures so\nrun on an already prepared database."}),"\n",(0,i.jsx)(n.h2,{id:"cosmic",children:"Cosmic"}),"\n",(0,i.jsxs)(n.p,{children:["The Clematis Cosmic application uses ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-hibernate",children:"Hibernate to initialize"}),"\na database with the following settings:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",metastring:'title="src/main/resources/application.yml"',children:"spring:\n  jpa:\n    show-sql: true\n    generate-ddl: true\n    hibernate:\n      ddl-auto: create-drop\n      naming:\n        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl\n"})}),"\n",(0,i.jsx)(n.p,{children:"This approach has required a careful expression of the desired target schema\nsince the result may not be exactly as expected, especially for\njoin tables and many-to-one, many-to-many relations, etc. For example:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-java",children:'@OneToMany(fetch = FetchType.EAGER, cascade = {\n    CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH, CascadeType.REMOVE\n})\n@JoinTable(\n    name = "project_runs",\n    joinColumns = @JoinColumn(\n        name = "project_id",\n        referencedColumnName = "id"\n    ),\n    inverseJoinColumns = @JoinColumn(\n        name = "input_id",\n        referencedColumnName = "id"\n    )\n)\n@OrderBy("date ASC")\nprivate final List<InputData> runs = new ArrayList<>();\n'})}),"\n",(0,i.jsxs)(n.p,{children:["The above code fragment describes the specification of join\ncolumns and reverse join columns to generate a proper\njoin table ",(0,i.jsx)(n.code,{children:"project_runs"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"clematis-weather",children:"Clematis Weather"}),"\n",(0,i.jsxs)(n.p,{children:["The application requires a massive initial import of the data, plus\nthe database schema is exposed not only to the application itself but\nalso to the Groovy script, which uses plain ",(0,i.jsx)(n.a,{href:"https://hibernate.org/",children:"Hibernate"}),"\nto store data."]}),"\n",(0,i.jsxs)(n.p,{children:["Therefore, a high-level migration tool ",(0,i.jsx)(n.a,{href:"https://www.red-gate.com/products/flyway/",children:"Flyway"})," is used.\nSpring Boot ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.migration-tool",children:"supports"}),"\nthis type of migration and provides a special resource folder for the migraton\nfiles, called ",(0,i.jsx)(n.code,{children:"classpath:db/migration"}),"."]}),"\n",(0,i.jsx)(n.h3,{id:"configuration",children:"Configuration"}),"\n",(0,i.jsx)(n.p,{children:"A Gradle plugin and a few additional dependencies are added to the project:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-groovy",metastring:'title="build.gradle"',children:'plugins {\n    id "org.flywaydb.flyway" version "9.8.1"\n}\n\ndependencies {\n    implementation "org.flywaydb:flyway-core:10.15.2"\n    implementation "org.flywaydb:flyway-mysql:10.15.2"\n}\n'})}),"\n",(0,i.jsx)(n.p,{children:"The migration folder looks like below:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"tools\n \u2514\u2500 parser \n    \u2514\u2500 src\n       \u2514\u2500 main\n          \u2514\u2500 resources\n             \u2514\u2500 db\n                \u2514\u2500 migration\n                   \u2514\u2500 h2\n                      \u251c\u2500 V1_1__added_weather_image.sql\n                      \u2514\u2500 V1__init.sql\n ...\n"})}),"\n",(0,i.jsx)(n.p,{children:"Then Spring Boot will automatically apply this migration on every\napplication start and before tests."}),"\n",(0,i.jsx)(n.h3,{id:"data-import",children:"Data Import"}),"\n",(0,i.jsx)(n.p,{children:"Clematis Weather application is using a configuration bean to\nimport textual and photo weather data:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-java",metastring:'title="src/main/groovy/org/clematis/weather/config/DataImporterConfig.groovy"',children:"@Component\n@SuppressFBWarnings\n@Profile(value = \"staging\")\nclass DataImporterConfig {\n\n    @Value('${jworkspace.weather.images.dir}')\n    private String path\n\n    @Bean\n    CommandLineRunner importWeather(EntityManager entityManager, TransactionTemplate transactionTemplate) {\n        return (args) -> transactionTemplate.execute(new TransactionCallbackWithoutResult() {\n            @Override\n            protected void doInTransactionWithoutResult(TransactionStatus status) {\n                Session session = entityManager.unwrap(Session.class)\n                WeatherImporter.loadWeatherData(session)\n            }\n        })\n    }\n\n    @Bean\n    CommandLineRunner importWeatherImages(EntityManager entityManager, TransactionTemplate transactionTemplate) {\n        return (args) -> transactionTemplate.execute(new TransactionCallbackWithoutResult() {\n            @Override\n            protected void doInTransactionWithoutResult(TransactionStatus status) {\n                WeatherImagesImporter.loadWeatherImages(Path.of(path), entityManager.unwrap(Session.class))\n            }\n        })\n    }\n}\n"})}),"\n",(0,i.jsxs)(n.p,{children:["Both beans are instances of ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/api/java/org/springframework/boot/CommandLineRunner.html",children:(0,i.jsx)(n.code,{children:"CommandLineRunner"})}),"\ninterface to run a standalone data importer tool on application start."]}),"\n",(0,i.jsx)(n.h2,{id:"dependable-components",children:"Dependable Components"}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["There is an annotation @DependsOnDatabaseInitialization\nfor every ",(0,i.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.dependencies.depends-on-initialization-detection",children:"component dependable"}),"\non the database initialization."]})})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},28453:(e,n,a)=>{a.d(n,{R:()=>o,x:()=>r});var t=a(96540);const i={},s=t.createContext(i);function o(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);