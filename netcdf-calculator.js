"use strict";

function readNumber(elemid) {
    return parseFloat(document.getElementById(elemid).value);
}

function formatNumber(num) {
    // TODO e-format
    return (num === null) ? "-" : num.toFixed(12).replace(/\.?0*$/, "");
}

function calculateFromRange(exp, min, max, fill) {
    if (min > max) {
        [min, max] = [max, min];
    }
    if (fill) {
        let scale = (max - min) / (Math.pow(2, exp) - 2);
        let offset = 0.5 * (max + min);
        return [scale, offset, -Math.pow(2, exp-1)];
    } else {
        let scale = (max - min) / (Math.pow(2, exp) - 1);
        let offset = min + Math.pow(2, exp - 1) * scale;
        return [scale, offset, null];
    }
}

function calculateFromParam(exp, scale, offset, fill) {
    let filler = fill ? -Math.pow(2, exp-1) : null
    return [scale, offset, filler];
}

function writeCell(exp, which, value) {
    document.getElementById("int" + exp + "-" + which).innerHTML = (value === null) ? "-" : value.toString();
}

function fillTable() {
    if (state === null) {
        return;
    }
    let [calculate, x, y] = state;
    let fill = document.getElementById("input-fill").checked;
    for (let exp of [8, 16, 32]) {
        let [scale, offset, filler] = calculate(exp, x, y, fill)
        let min = -Math.pow(2, exp-1) + (fill ? 1 : 0);
        let mid = 0;
        let max = Math.pow(2, exp-1) - 1;
        writeCell(exp, "scale",  formatNumber(scale));
        writeCell(exp, "offset", formatNumber(offset));
        writeCell(exp, "fill", formatNumber(filler));
        writeCell(exp, "min",  formatNumber(scale * (min  ) + offset));
        writeCell(exp, "minp", formatNumber(scale * (min+1) + offset));
        writeCell(exp, "midm", formatNumber(scale * (mid-1) + offset));
        writeCell(exp, "mid",  formatNumber(scale * (mid  ) + offset));
        writeCell(exp, "midp", formatNumber(scale * (mid+1) + offset));
        writeCell(exp, "maxm", formatNumber(scale * (max-1) + offset));
        writeCell(exp, "max",  formatNumber(scale * (max  ) + offset));
        let xarray_dict = [
            '"dtype": "int' + exp + '"',
            '"scale_factor": ' + scale,
            '"add_offset": ' + offset
        ];
        if (fill) {
            xarray_dict.push('"_FillValue": ' + filler);
        }

        document.getElementById("xarray-int" + exp).innerHTML = "{ " + xarray_dict.join(", ") + " }";
    }
}


let state = null;

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("calculate-range").addEventListener("click", function () {
        state = [calculateFromRange, readNumber("input-min"), readNumber("input-max")];
        fillTable();
    });
    document.getElementById("calculate-param").addEventListener("click", function () {
        state = [calculateFromParam, readNumber("input-scale"), readNumber("input-offset")];
        fillTable();
    });
    document.getElementById("input-fill").addEventListener("change", function () {
        fillTable();
    });
});

