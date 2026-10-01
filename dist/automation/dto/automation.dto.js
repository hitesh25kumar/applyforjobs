"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartInstagramAutomationDto = exports.StartNaukriAutomationDto = exports.StartLinkedInAutomationDto = void 0;
const class_validator_1 = require("class-validator");
class StartLinkedInAutomationDto {
}
exports.StartLinkedInAutomationDto = StartLinkedInAutomationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartLinkedInAutomationDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartLinkedInAutomationDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StartLinkedInAutomationDto.prototype, "maxJobs", void 0);
class StartNaukriAutomationDto {
}
exports.StartNaukriAutomationDto = StartNaukriAutomationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartNaukriAutomationDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StartNaukriAutomationDto.prototype, "maxJobs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StartNaukriAutomationDto.prototype, "headless", void 0);
class StartInstagramAutomationDto {
}
exports.StartInstagramAutomationDto = StartInstagramAutomationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartInstagramAutomationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StartInstagramAutomationDto.prototype, "maxMessages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StartInstagramAutomationDto.prototype, "useRequests", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StartInstagramAutomationDto.prototype, "clearData", void 0);
//# sourceMappingURL=automation.dto.js.map