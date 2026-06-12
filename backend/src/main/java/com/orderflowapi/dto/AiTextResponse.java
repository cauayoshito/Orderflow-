package com.orderflowapi.dto;

/**
 * Generic single-text AI response (description, summary or suggestions).
 */
public class AiTextResponse {

    private String result;
    private String model;

    public AiTextResponse(String result, String model) {
        this.result = result;
        this.model = model;
    }

    public String getResult() {
        return result;
    }

    public String getModel() {
        return model;
    }
}
