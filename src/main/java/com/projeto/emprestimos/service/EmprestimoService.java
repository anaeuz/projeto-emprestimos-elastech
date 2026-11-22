package com.projeto.emprestimos.service;

import com.projeto.emprestimos.model.Emprestimo;
import com.projeto.emprestimos.model.Equipamento;
import com.projeto.emprestimos.repository.ColaboradorRepository;
import com.projeto.emprestimos.repository.EmprestimoRepository;
import com.projeto.emprestimos.repository.EquipamentoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmprestimoService {

    private final EmprestimoRepository repository;
    private final EquipamentoRepository equipamentoRepository;
    private final ColaboradorRepository colaboradorRepository;

    public EmprestimoService(EmprestimoRepository repository,
                             EquipamentoRepository equipamentoRepository,
                             ColaboradorRepository colaboradorRepository) {
        this.repository = repository;
        this.equipamentoRepository = equipamentoRepository;
        this.colaboradorRepository = colaboradorRepository;
    }

    public List<Emprestimo> listar(Boolean atrasados) {
        if (Boolean.TRUE.equals(atrasados)) {
            return repository.findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(LocalDate.now());
        }
        return repository.findAll();
    }

    public Emprestimo buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));
    }

    public List<Emprestimo> listarDoColaborador(Long colaboradorId) {
        if (!colaboradorRepository.existsById(colaboradorId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Colaborador não encontrado");
        }
        return repository.findByColaboradorId(colaboradorId);
    }

    @Transactional
    public Emprestimo emprestar(Long equipamentoId, Long colaboradorId) {
        LocalDate hoje = LocalDate.now();

        Equipamento equipamento = equipamentoRepository.findById(equipamentoId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado"));

        if (!colaboradorRepository.existsById(colaboradorId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Colaborador não encontrado");
        }

        if (repository.existsByColaboradorIdAndDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(colaboradorId, hoje)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Colaborador está com um empréstimo atrasado");
        }

        equipamento.emprestar();
        Emprestimo emprestimo = new Emprestimo(equipamentoId, colaboradorId, hoje);

        equipamentoRepository.save(equipamento);
        return repository.save(emprestimo);
    }

    @Transactional
    public Emprestimo devolver(Long id) {
        Emprestimo emprestimo = buscar(id);

        emprestimo.devolver(LocalDate.now());

        Equipamento equipamento = equipamentoRepository.findById(emprestimo.getEquipamentoId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado"));
        equipamento.devolver();

        equipamentoRepository.save(equipamento);
        return repository.save(emprestimo);
    }
}
