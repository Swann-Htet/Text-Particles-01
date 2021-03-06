from line 46

(function(){
    var deviceRatio = window.devicePixelRatio || 1;

    // detect mouse move
    var mouseX = null;
    var mouseY = null;
    var mousedown = false;

    function saveMouseCoords(event) {
        mouseX = event.clientX * deviceRatio;
        mouseY = event.clientY * deviceRatio;
    }

    window.addEventListener('mousedown', function(event) {
        mousedown = true;
        saveMouseCoords(event);

        window.addEventListener('mousemove', saveMouseCoords);
    });
    window.addEventListener('mouseup', function(event) {
        mousedown = false;

        window.removeEventListener('mousemove', saveMouseCoords);
    });

    // get canvas
    var canvas = document.querySelector("canvas");
    ctx = canvas.getContext('2d');

    var width = Math.floor(window.innerWidth * deviceRatio);
    var height = Math.floor(window.innerHeight * deviceRatio);

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    var gravity = 0.0002;
    var mouseRepel = 0.3;
    var mouseDistanceFeel = 500;
    var bouncabilityMin = 0.4;
    var bouncabilityMax = 0.75;
    var bouncabilitySecondAxis = 0.85;
    var pointsNumber = 800;

    var points = [];
    var i;
    for (i = 0; i < pointsNumber; i++) {
        points[i] = [
            Math.random() * width | 0,  // x
            Math.random() * height | 0, // y
            Math.random() * 0.7 - 0.35, // x velocity
            Math.random() * 0.7 - 0.35  // y velocity
        ];
    }

    var prevTime = Date.now();
    var nowTime = prevTime;
    var timeDiff,
        gravityVAdjustment;
    var xMouseDistance, yMouseDistance, xMouseRatio, yMouseRatio;
    var abs = Math.abs;
    var bouncabilityThisFrame;

    function setBouncability() {
        if(bouncabilityThisFrame === null) {
            bouncabilityThisFrame = bouncabilityMin +
                Math.random() * (bouncabilityMax - bouncabilityMin)
        }
    }

    function revertVelocity(axis) {
        // velocity vector change
        points[i][axis + 2] *= -1 * bouncabilityThisFrame;
        if(axis === 0) {
            points[i][3] *= bouncabilitySecondAxis;
        } else {
            points[i][2] *= bouncabilitySecondAxis;
        }
    }

    function frame() {
        prevTime = nowTime;
        nowTime = Date.now();

        timeDiff = nowTime - prevTime;

        // clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        // ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgb(30, 70, 255)';

        gravityVAdjustment = timeDiff * gravity;

        bouncabilityThisFrame = null;
        for (i = 0; i < pointsNumber; i++) {
            // Adjust y velocity with gravity
            points[i][3] = points[i][3] + gravityVAdjustment;

            // Adjust y velocity with mouse
            if(mousedown) {
                xMouseDistance = points[i][0] - mouseX;
                xMouseRatio = (1 - abs(xMouseDistance) / mouseDistanceFeel);

                if(xMouseRatio > 0 && xMouseRatio <= 1) {
                    yMouseDistance = points[i][1] - mouseY;
                    yMouseRatio = (1 - abs(yMouseDistance) / mouseDistanceFeel);

                    if(yMouseRatio > 0 && yMouseRatio <= 1) {

                        if(xMouseDistance > 0 && xMouseDistance < mouseDistanceFeel) {
                            points[i][2] += mouseRepel * xMouseRatio * yMouseRatio * yMouseRatio;
                        } else if(xMouseDistance < 0 && xMouseDistance > -mouseDistanceFeel ) {
                            points[i][2] -= mouseRepel * xMouseRatio * yMouseRatio * yMouseRatio;
                        }

                        if(yMouseDistance > 0 && yMouseDistance < mouseDistanceFeel) {
                            points[i][3] += mouseRepel * yMouseRatio * xMouseRatio * xMouseRatio;
                        } else if(yMouseDistance < 0 && yMouseDistance > -mouseDistanceFeel ) {
                            points[i][3] -= mouseRepel * yMouseRatio * xMouseRatio * xMouseRatio;
                        }
                    }
                }

            }

            points[i][0] = (points[i][0] + timeDiff * points[i][2]);
            points[i][1] = (points[i][1] + timeDiff * points[i][3]);

            // Check for collision and bounce
            if( points[i][0] < 0 ) {
                setBouncability();
                // coordinates
                points[i][0] *= -1 * bouncabilityThisFrame;
                revertVelocity(0);
            } else if( points[i][0] > width ) {
                setBouncability();
                // coordinates
                points[i][0] = width - ((points[i][0] - width) * bouncabilityThisFrame);
                revertVelocity(0);
            }

            if( points[i][1] < 0 ) {
                setBouncability();
                // coordinates
                points[i][1] *= -1 * bouncabilityThisFrame;
                revertVelocity(1);
            } else if( points[i][1] > height ) {
                setBouncability();
                // coordinates
                points[i][1] = height - ((points[i][1] - height) * bouncabilityThisFrame);
                revertVelocity(1);
            }

            ctx.fillRect(points[i][0]-1, points[i][1]-1, 2, 2);
        }

        window.requestAnimationFrame( frame );
    }
    frame();

})();