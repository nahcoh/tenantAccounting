package com.starter.controller;

import com.starter.dto.ItemRequest;
import com.starter.dto.ItemResponse;
import com.starter.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Item", description = "아이템 관리 API")
@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @Operation(summary = "모든 아이템 조회", description = "등록된 모든 아이템을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "아이템 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = ItemResponse.class))
        )
    })
    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @Operation(summary = "아이템 상세 조회", description = "특정 아이템의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "아이템 조회 성공",
            content = @Content(schema = @Schema(implementation = ItemResponse.class))
        ),
        @ApiResponse(responseCode = "404", description = "아이템을 찾을 수 없습니다")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItem(id));
    }

    @Operation(summary = "아이템 생성", description = "새로운 아이템을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "아이템 생성 성공",
            content = @Content(schema = @Schema(implementation = ItemResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터")
    })
    @PostMapping
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request) {
        ItemResponse response = itemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "아이템 수정", description = "기존 아이템을 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "아이템 수정 성공",
            content = @Content(schema = @Schema(implementation = ItemResponse.class))
        ),
        @ApiResponse(responseCode = "404", description = "아이템을 찾을 수 없습니다"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request) {
        ItemResponse response = itemService.updateItem(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "아이템 삭제", description = "아이템을 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "아이템 삭제 성공"),
        @ApiResponse(responseCode = "404", description = "아이템을 찾을 수 없습니다")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
