'use strict';var game={SCREEN_WIDTH:480,SCREEN_HEIGHT:270,camera:null,scene:null,renderer:null};
(function(b){function i(c){requestAnimationFrame(i);void 0!==h&&k.update(c-h);h=c;game.renderer.render(game.scene,game.camera)}var c,l,j,k,h;b.addEventListener("load",function(){var e=game.scene=new THREE.Scene,a=game.camera=new THREE.PerspectiveCamera(35,game.SCREEN_WIDTH/game.SCREEN_HEIGHT,1,1E3);a.position.set(60,120,60);a.lookAt(e.position);e.add(a);e.add(new THREE.AmbientLight(4294967295));a=THREE.ImageUtils.loadTexture("resource/ground.jpg");a.wrapS=a.wrapT=THREE.MirroredRepeatWrapping;a.magFilter=
THREE.NearestFilter;a.minFilter=THREE.NearestMipMapLinearFilter;a.repeat.set(4,4);l=new THREE.MeshBasicMaterial({map:a});c=new THREE.Geometry;var d,f=new THREE.Vector3(0,0,1);for(d=0;11>d;d++)for(a=0;11>a;a++)c.vertices.push(new THREE.Vector3(50*a-250,-(50*d-250),0));for(d=0;10>d;d++)for(a=0;10>a;a++){var h=a+11*(d+1),n=a+1+11*(d+1),m=a+1+11*d,g=new THREE.Face3(a+11*d,h,m);g.normal.copy(f);g.vertexNormals.push(f.clone(),f.clone(),f.clone());c.faces.push(g);c.faceVertexUvs[0].push([new THREE.UV(a/
10,1-d/10),new THREE.UV(a/10,1-(d+1)/10),new THREE.UV((a+1)/10,1-d/10)]);g=new THREE.Face3(h,n,m);g.normal.copy(f);g.vertexNormals.push(f.clone(),f.clone(),f.clone());c.faces.push(g);c.faceVertexUvs[0].push([new THREE.UV(a/10,1-(d+1)/10),new THREE.UV((a+1)/10,1-(d+1)/10),new THREE.UV((a+1)/10,1-d/10)])}c.computeCentroids();a=0;for(d=c.vertices.length;a<d;a++)c.vertices[a].z=20*Math.random();c.computeFaceNormals();c.computeCentroids();j=new THREE.Mesh(c,l);j.rotation.x=-Math.PI/2;e.add(j);e=game.renderer=
new THREE.WebGLRenderer;e.setSize(game.SCREEN_WIDTH,game.SCREEN_HEIGHT);e.setClearColor(new THREE.Color(3368601));e=e.domElement;e.style.width=""+2*game.SCREEN_WIDTH+"px";e.style.height=""+2*game.SCREEN_HEIGHT+"px";b.document.getElementById("content").appendChild(e);k=new game.PlayerController;k.landMesh=j;i()})})(this);(function(b){b.PlayerController=function(){this._mesh=null;this._velocity=new THREE.Vector3(0,0,0);this._cameraAngle=0;this.initialize()};b.PlayerController.landMesh=null;b.PlayerController.prototype.initialize=function(){this._mesh=new THREE.Mesh(new THREE.CubeGeometry(5,10,3),new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("resource/tree.jpg")}));b.scene.add(this._mesh);var i=document.createElement("div");i.id="debugElem";document.body.appendChild(i);window.addEventListener("keydown",
function(c){switch(c.keyCode){case 38:case 87:this._velocity.x=0.2;break;case 40:case 83:this._velocity.x=-0.2;break;case 37:case 65:this._velocity.z=-0.2;break;case 39:case 68:this._velocity.z=0.2}c.preventDefault()}.bind(this));window.addEventListener("keyup",function(c){switch(c.keyCode){case 38:case 40:case 87:case 83:this._velocity.x=0;break;case 37:case 39:case 65:case 68:this._velocity.z=0}c.preventDefault()}.bind(this))};b.PlayerController.prototype.update=function(){this._mesh.position.addSelf(this._velocity);
null!==this._landMesh&&this.land();document.getElementById("debugElem").innerHTML+="<br/>"+this._mesh.position.x.toFixed(2)+" "+this._mesh.position.y.toFixed(2)+" "+this._mesh.position.z.toFixed(2);b.camera.position.set(this._mesh.position.x,this._mesh.position.y,this._mesh.position.z);this._cameraAngle+=0.002;b.camera.position.x+=70*Math.sin(this._cameraAngle);b.camera.position.z+=70*Math.cos(this._cameraAngle);b.camera.position.y+=15;b.camera.lookAt(this._mesh.position)};b.PlayerController.prototype.land=
function(){var b=this._mesh.position.clone();b.y+=1E3;var c=new THREE.Vector3(0,-1,0),b=(new THREE.Ray(b,c)).intersectObject(this.landMesh);0<b.length?(this._mesh.position.y=b[0].point.y+5,document.getElementById("debugElem").innerHTML="\u7740\u5730\u3057\u3066\u3044\u308bface: "+b[0].faceIndex):document.getElementById("debugElem").innerHTML="\u7740\u5730\u3057\u3066\u3044\u306a\u3044"}})(game);
