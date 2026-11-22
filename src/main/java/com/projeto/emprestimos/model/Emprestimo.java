package com.projeto.emprestimos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
public class Emprestimo {

    private static final int DIAS_DE_EMPRESTIMO = 14;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long equipamentoId;

    @Column(nullable = false)
    private Long colaboradorId;

    @Column(nullable = false)
    private LocalDate dataEmprestimo;

    @Column(nullable = false)
    private LocalDate dataPrevistaDevolucao;

    private LocalDate dataDevolucao;

    public Emprestimo() { }

    public Emprestimo(Long equipamentoId, Long colaboradorId, LocalDate hoje) {
        this.equipamentoId = equipamentoId;
        this.colaboradorId = colaboradorId;
        this.dataEmprestimo = hoje;
        this.dataPrevistaDevolucao = hoje.plusDays(DIAS_DE_EMPRESTIMO);
    }

    public void devolver(LocalDate data) {
        if (dataDevolucao != null) {
            throw new IllegalStateException("Empréstimo já devolvido");
        }
        this.dataDevolucao = data;
    }

    public boolean estaAtrasadoEm(LocalDate data) {
        return dataDevolucao == null && dataPrevistaDevolucao.isBefore(data);
    }

    public boolean isAtrasado() {
        return estaAtrasadoEm(LocalDate.now());
    }

    public Long getId() { return id; }
    public Long getEquipamentoId() { return equipamentoId; }
    public Long getColaboradorId() { return colaboradorId; }
    public LocalDate getDataEmprestimo() { return dataEmprestimo; }
    public LocalDate getDataPrevistaDevolucao() { return dataPrevistaDevolucao; }
    public LocalDate getDataDevolucao() { return dataDevolucao; }
}
