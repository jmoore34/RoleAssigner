(this.webpackJsonproleassigner=this.webpackJsonproleassigner||[]).push([[0],{109:function(e,t,n){},110:function(e,t,n){},125:function(e,t,n){"use strict";n.r(t);var a=n(4),r=n(0),c=n.n(r),o=n(11),i=n.n(o),l=(n(109),n(110),n(72)),s=n(12),u=n(18),j=n(36),d=n(178),b=n(162),m=n(25);function O(){var e=Object(j.a)(["\n  width: 100vw;\n  min-height: 60vh; // may need to be >100vh on mobile\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-direction: column;\n"]);return O=function(){return e},e}function h(){var e=Object(j.a)(["\n  width: 500px;\n  @media (max-width: 500px) {\n    width: 100vw;\n  }\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n"]);return h=function(){return e},e}function f(){var e=Object(j.a)(["\n  width: 100%;\n  display: flex;\n  \n  justify-content: center;\n  align-items: center;\n  flex-direction: row;\n"]);return f=function(){return e},e}var x,v=m.a.div(f()),g=m.a.div(h()),y=m.a.div(O()),p=function(e){var t=Object(r.useState)(""),n=Object(u.a)(t,2),c=n[0],o=n[1],i=Object(s.f)(),l=function(){c.length>0&&i.push("".concat(c))};return Object(a.jsx)(a.Fragment,{children:Object(a.jsx)(y,{children:Object(a.jsxs)(g,{children:[Object(a.jsx)("h1",{children:"Role Assigner"}),Object(a.jsx)("p",{children:"An online chat room where you anonymously divvy up roles. To create a new room or join an existing one, enter a room name and click the button."}),Object(a.jsxs)(v,{children:[Object(a.jsx)(d.a,{id:"outlined-basic",label:"Room name",variant:"outlined",size:"medium",placeholder:"Room name",fullWidth:!0,onChange:function(e){return o(e.target.value)},onKeyPress:function(e){"Enter"===e.key&&l()}}),Object(a.jsx)(b.a,{variant:"contained",onClick:l,children:"Join room"})]})]})})})},C=n(38),S=n(57),T=n(30),E=n.n(T);!function(e){e.PUBLIC="PUBLIC",e.ANON="ANON",e.TO_MOD="TO_MOD",e.TEAM="TEAM",e.ROLE="ROLE",e.SYSTEM="SYSTEM"}(x||(x={}));var q=[x.PUBLIC,x.ANON,x.TO_MOD,x.TEAM,x.ROLE];function w(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase().replace(/_/g," ")}var M=n(21),R=n(168),N=n(170),k=n(179),A=n(161),D=n(128),I=n(171),L=n(184),P=n(172),F=n(176),G=n(173),B=n(180),U=n(164),Y=n(174),J=n(44),W=n(163),_=n(90),K=n.n(_),z=function(e){return Object(a.jsx)(a.Fragment,{children:Object(a.jsxs)(M.b,{columns:"1fr 1fr 4ch auto",children:[Object(a.jsx)(M.a,{children:Object(a.jsx)(d.a,{label:"Role Name",fullWidth:!0,value:e.role.name,onChange:function(t){return e.onChange(Object(J.a)(Object(J.a)({},e.role),{},{name:t.target.value}))}})}),Object(a.jsx)(M.a,{children:Object(a.jsx)(d.a,{label:"Role Team",fullWidth:!0,value:e.role.team,onChange:function(t){return e.onChange(Object(J.a)(Object(J.a)({},e.role),{},{team:t.target.value}))}})}),Object(a.jsx)(M.a,{children:Object(a.jsx)(d.a,{label:"Quantity",type:"number",fullWidth:!0,value:e.role.quantity,onChange:function(t){return e.onChange(Object(J.a)(Object(J.a)({},e.role),{},{quantity:parseInt(t.target.value)}))}})}),Object(a.jsx)(M.a,{children:Object(a.jsx)(W.a,{onClick:function(){e.onChange(null)},children:Object(a.jsx)(K.a,{})})})]})})},H=n(91),Q=n.n(H),V=n(92),X=n.n(V),Z=n(165),$=n(166),ee=n(167);function te(e){var t;if(null===e)return"A role assigment occurred.";var n=null!==(t=null===e||void 0===e?void 0:e.role)&&void 0!==t?t:'""';return"".concat(null===e||void 0===e?void 0:e.requested_by," requested a role assignment. Your assigned role is ").concat(n," ").concat((null===e||void 0===e?void 0:e.team)?" and your team is ".concat(e.team,"."):".")}var ne=function(e){var t,n,r=null!==(t=null===(n=e.assignment)||void 0===n?void 0:n.role)&&void 0!==t?t:'""';return Object(a.jsxs)(B.a,{open:null!=e.assignment,onClose:e.onClose,children:[Object(a.jsxs)(U.a,{children:["Your role is ",r]}),Object(a.jsx)(Z.a,{children:Object(a.jsx)($.a,{children:te(e.assignment)})}),Object(a.jsx)(ee.a,{children:Object(a.jsx)(b.a,{onClick:e.onClose,color:"primary",autoFocus:!0,children:"Close"})})]})},ae=n(182),re=n(183),ce=[{name:"Empty",roles:[]},{name:"Secret Hitler",roles:[{name:"Hitler",quantity:1,team:"Evil"},{name:"Facist",quantity:2,team:"Evil"},{name:"Liberal",quantity:4,team:"Good"}]},{name:"Avalon",roles:[{name:"Assassin",quantity:1,team:"Evil"},{name:"Morgana",quantity:1,team:"Evil"},{name:"Mordred",quantity:1,team:"Evil"},{name:"Merlin",quantity:1,team:"Good"},{name:"Percival",quantity:1,team:"Good"},{name:"Liberal",quantity:2,team:"Good"}]},{name:"Mafia",roles:[{name:"Mafia",quantity:3,team:"Evil"},{name:"Detective",quantity:1,team:"Good"},{name:"Medic",quantity:1,team:"Good"},{name:"Liberal",quantity:10,team:"Good"}]},{name:"Code Names",roles:[{name:"Red Code Master",quantity:1,team:"Red"},{name:"Blue Code Master",quantity:1,team:"Blue"},{name:"Red Team Member",quantity:2,team:"Red"},{name:"Blue Team Memeber",quantity:2,team:"Blue"}]},{name:"Two Team (General)",roles:[{name:"Players of Team 1",quantity:5,team:"Team 1"},{name:"Players of Team 2",quantity:5,team:"Team 2"}]}],oe=Object(ae.a)(re.a)({margin:"0.15rem"}),ie=function(e){var t=Object(r.useState)(null),n=Object(u.a)(t,2),c=n[0],o=n[1];return Object(r.useEffect)((function(){e.visible||o(null)}),[e.visible]),Object(a.jsxs)(B.a,{open:e.visible,onClose:function(){return e.onSelect(null)},children:[Object(a.jsx)(U.a,{children:"Choose a role preset"}),Object(a.jsx)(Z.a,{children:ce.map((function(e){return Object(a.jsx)(oe,{label:e.name,color:c===e?"primary":"default",onClick:function(){return o(e)}},e.name)}))}),Object(a.jsxs)(ee.a,{children:[Object(a.jsx)(b.a,{onClick:function(){return e.onSelect(null)},color:"primary",autoFocus:!0,children:"Cancel"}),Object(a.jsx)(b.a,{onClick:function(){return e.onSelect(c)},color:"primary",autoFocus:!0,children:"Select"})]})]})},le=n(169);function se(){var e=Object(j.a)(["\n  color: red;\n  font-style: italic;\n"]);return se=function(){return e},e}function ue(){var e=Object(j.a)(["\n  ","\n  ","\n  ","\n  overflow-wrap: break-word; // prevent expanding horizontally past the bounds of the container\n  height: unset; // corrects a bug in library\n"]);return ue=function(){return e},e}function je(){var e=Object(j.a)(["\n  width: 100vw;\n  min-height: 100vh; // may need to be >100vh on mobile\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-direction: column;\n"]);return je=function(){return e},e}var de=m.a.div(je()),be=Object(m.a)(M.a)(ue(),(function(e){return e.padded&&"padding: 0.5rem;"}),(function(e){return e.boxed&&"border: 3px solid red;"}),(function(e){return e.scroll&&"overflow-y: auto;"})),me=m.a.div(se()),Oe=function(e){var t=Object(r.useRef)(null);if(Object(r.useEffect)((function(){var e=t.current;null===e||void 0===e||e.scrollIntoView()}),[]),e.chat.type==x.SYSTEM)return Object(a.jsx)(me,{children:e.chat.msg});if(!e.chat||!e.chat.type)return Object(a.jsx)(a.Fragment,{});var n=e.chat.type==x.ANON?"Anonymous":e.chat.name;return Object(a.jsxs)("div",{ref:t,children:["[",w(e.chat.type),"] ",e.chat.team&&"(".concat(e.chat.team,") "),e.chat.role&&"(".concat(e.chat.role,") "),Object(a.jsxs)("b",{children:[n,":"]})," ",e.chat.msg,Object(a.jsx)("br",{})]})};function he(e,t,n){var a=Object(S.a)(e);return n?a[t]=n:a.splice(t,1),a}var fe=null,xe={type:x.SYSTEM,msg:"Welcome to the role assignment room! To invite others, share the URL."},ve=function(e){var t,n=Object(s.g)().roomCode,c=E()("wss://roleassigner.herokuapp.com/".concat(n.toLowerCase()),{retryOnError:!0,reconnectInterval:4e3,reconnectAttempts:9}),o=(c.sendMessage,c.sendJsonMessage),i=(c.lastMessage,c.lastJsonMessage),l=c.readyState,j=(t={},Object(C.a)(t,T.ReadyState.CONNECTING,"Connecting to server..."),Object(C.a)(t,T.ReadyState.OPEN,"Connection established."),Object(C.a)(t,T.ReadyState.CLOSING,"Closing..."),Object(C.a)(t,T.ReadyState.CLOSED,"Connection closed."),Object(C.a)(t,T.ReadyState.UNINSTANTIATED,"Connection uninstantiated"),t)[l],m=Object(r.useState)(x.PUBLIC),O=Object(u.a)(m,2),h=O[0],f=O[1],v=Object(r.useState)(""),g=Object(u.a)(v,2),y=g[0],p=g[1],J=Object(r.useState)([xe]),W=Object(u.a)(J,2),_=W[0],K=W[1],H=Object(r.useState)([]),V=Object(u.a)(H,2),Z=V[0],$=V[1],ee=Object(r.useState)([]),ae=Object(u.a)(ee,2),re=ae[0],ce=ae[1],oe=Object(r.useState)(!1),se=Object(u.a)(oe,2),ue=se[0],je=se[1],me=Object(r.useState)("Unnamed User"),ve=Object(u.a)(me,2),ge=ve[0],ye=ve[1],pe=Object(r.useState)(null),Ce=Object(u.a)(pe,2),Se=Ce[0],Te=Ce[1],Ee=Object(r.useState)(!1),qe=Object(u.a)(Ee,2),we=qe[0],Me=qe[1],Re=Object(R.a)("(max-width:".concat(1012.5,"px)"));return Object(r.useEffect)((function(){if(i){console.log(JSON.stringify(i));var e=i;if(e.chat)K([].concat(Object(S.a)(_),[e.chat]));else if(e.roles)$(e.roles);else if(e.roleDelta)Z[e.roleDelta.index]&&Z[e.roleDelta.index].updateRequestTimeout&&clearTimeout(Z[e.roleDelta.index].updateRequestTimeout),$(he(Z,e.roleDelta.index,e.roleDelta.edit));else if(e.users)ce(e.users);else if(e.userDelta)ce(he(re,e.userDelta.index,e.userDelta.edit));else if(e.assignment){Te(e.assignment);var t={msg:te(e.assignment),type:x.SYSTEM};K([].concat(Object(S.a)(_),[t]))}}}),[i]),console.log("roles -> "+JSON.stringify(Z)),Object(a.jsxs)(a.Fragment,{children:[Object(a.jsx)(de,{children:Object(a.jsxs)(M.b,{columns:Re?"1fr":"repeat(2, ".concat(450,"px)"),style:{margin:"1rem"},rows:Re?"auto auto 300px auto":"repeat(2, 300px) auto",areas:Re?["role","userlist","history","message"]:["role      userlist","history   history","message   message"],children:[Object(a.jsxs)(be,{area:"role",padded:!0,boxed:!0,scroll:!0,children:[Z.map((function(e,t){return Object(a.jsx)(z,{role:e,onChange:function(n){var a={roleDelta:{index:t,edit:n}};if(n){e.updateRequestTimeout&&clearTimeout(e.updateRequestTimeout);var r=window.setTimeout((function(){o(a),e.updateRequestTimeout=null}),1e3),c=Object(S.a)(Z);c[t]=n,c[t].updateRequestTimeout=r,$(c)}else o(a)}},t)})),Object(a.jsx)(b.a,{startIcon:Object(a.jsx)(Q.a,{}),onClick:function(){var e={roleDelta:{index:Z.length,edit:{name:"",team:"",quantity:1}}};o(e)},children:"Add role"}),Object(a.jsx)(b.a,{startIcon:Object(a.jsx)(X.a,{}),onClick:function(){o({chat:{msg:"/assign"}})},children:"Assign roles to users"}),Object(a.jsx)(b.a,{startIcon:Object(a.jsx)(le.a,{}),onClick:function(){return Me(!0)},children:"Use preset"})]}),Object(a.jsxs)(be,{area:"userlist",padded:!0,boxed:!0,scroll:!0,children:[Object(a.jsx)(d.a,{label:"Your user name",value:ge,onChange:function(e){ye(e.target.value);var t={name:e.target.value};fe&&clearTimeout(fe),fe=window.setTimeout((function(){o(t),fe=null}),1e3)}}),Object(a.jsx)(N.a,{control:Object(a.jsx)(k.a,{checked:ue,onChange:function(e){je(e.target.checked);var t={mod:e.target.checked};o(t)},inputProps:{"aria-label":"primary checkbox"}}),label:"Moderator opt-in"}),Object(a.jsx)(A.a,{children:re.map((function(e){return Object(a.jsxs)(D.a,{children:[Object(a.jsx)(I.a,{children:Object(a.jsx)(L.a,{})}),Object(a.jsx)(P.a,{primary:e.name,secondary:e.mod?"Moderator":ue&&"".concat(e.role," ").concat(e.team&&"(".concat(e.team,")"))})]})}))})]}),Object(a.jsx)(be,{area:"history",padded:!0,boxed:!0,scroll:!0,children:_.map((function(e){return Object(a.jsx)(Oe,{chat:e})}))}),Object(a.jsx)(M.a,{area:"message",children:Object(a.jsxs)(M.b,{columns:"8ch 1fr",children:[Object(a.jsx)(M.a,{children:Object(a.jsx)(F.a,{value:h,onChange:function(e){f(e.target.value)},children:q.map((function(e){return Object(a.jsx)(G.a,{value:e,children:w(e)})}))})}),Object(a.jsx)(M.a,{children:Object(a.jsx)(d.a,{fullWidth:!0,value:y,onChange:function(e){return p(e.target.value)},onKeyPress:function(e){"Enter"===e.key&&y.length>0&&(o({chat:{msg:y,type:h}}),p(""))}})})]})})]})}),Object(a.jsx)(ne,{assignment:Se,onClose:function(){return Te(null)}}),Object(a.jsx)(ie,{visible:we,onSelect:function(e){if(e){var t={roles:e.roles};o(t)}Me(!1)}}),Object(a.jsxs)(B.a,{disableBackdropClick:!0,disableEscapeKeyDown:!0,open:l!==T.ReadyState.OPEN,children:[Object(a.jsx)(U.a,{children:j}),(l===T.ReadyState.CONNECTING||l===T.ReadyState.CLOSING)&&Object(a.jsx)(Y.a,{})]})]})};var ge=function(){return Object(a.jsx)(l.a,{hashType:"noslash",children:Object(a.jsxs)(s.c,{children:[Object(a.jsx)(s.a,{path:"/:roomCode",children:Object(a.jsx)(ve,{})}),Object(a.jsx)(s.a,{path:"/",children:Object(a.jsx)(p,{})})]})})},ye=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,186)).then((function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,c=t.getLCP,o=t.getTTFB;n(e),a(e),r(e),c(e),o(e)}))};i.a.render(Object(a.jsx)(c.a.StrictMode,{children:Object(a.jsx)(ge,{})}),document.getElementById("root")),ye()}},[[125,1,2]]]);
//# sourceMappingURL=main.d9f38dcf.chunk.js.map