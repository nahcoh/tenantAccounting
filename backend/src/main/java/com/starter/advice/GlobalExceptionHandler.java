package com.starter.advice;

import com.mysql.cj.jdbc.exceptions.MysqlDataTruncation;
import com.starter.dto.response.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        Throwable rootCause = ex.getRootCause();
        if (rootCause instanceof MysqlDataTruncation) {
            if (rootCause.getMessage().contains("for column 'cost'")) {
                return new ErrorResponse("입력한 비용이 너무 큽니다. 100억 미만으로 입력해주세요.");
            }
        }
        return new ErrorResponse("데이터베이스 제약 조건 위반. 관리자에게 문의하세요.");
    }
}
